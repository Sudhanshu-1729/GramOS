import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.risk_service import RiskService
from app.services.forecasting_service import ForecastingService
from app.services.recommendation_service import RecommendationService
from app.schemas.schemas import VoiceQueryRequest, VoiceQueryResponse

# Translations Dictionary for vernacular outputs
TRANSLATIONS = {
    "hi": {
        "loan_eligible": "हाँ, आपकी व्यावसायिक स्वास्थ्य रेटिंग {score}/100 है, जो ऋण के लिए अच्छी है। आप नाबार्ड योजनाओं के माध्यम से ₹{amt:,.2f} तक के ऋण के लिए आवेदन कर सकते हैं।",
        "loan_not_eligible": "वर्तमान में आपका वित्तीय तनाव थोड़ा अधिक है। हमारा सुझाव है कि ऋण लेने से पहले आप पुराने उधारों का भुगतान करें।",
        "score_info": "आपका बिजनेस हेल्थ स्कोर {score}/100 है। आपका जोखिम स्तर {level} है।",
        "equipment_yes": "हाँ, आपका अगले 30 दिनों का कैश फ्लो पूर्वानुमान मजबूत है। आप उपकरण खरीद सकते हैं।",
        "equipment_no": "कृपया रुकें। अगले 30 दिनों में कैश फ्लो में ₹{dip:,.2f} की गिरावट होने की आशंका है। अभी उपकरण न खरीदें।",
        "scheme_info": "आपके लिए सबसे अनुकूल योजना '{scheme}' है, जिसमें {subsidy}% तक की सब्सिडी मिल सकती है।"
    },
    "en": {
        "loan_eligible": "Yes, your business health score is {score}/100, which qualifies for a credit line. You can apply for up to ₹{amt:,.2f} via NABARD programs.",
        "loan_not_eligible": "Currently your financial stress index is high. We recommend lowering outstanding loans before requesting new credit.",
        "score_info": "Your business health score is {score}/100. Your risk classification is {level}.",
        "equipment_yes": "Yes, your projected 30-day cash flow is strong. You have sufficient working capital to purchase equipment.",
        "equipment_no": "Caution. Cash flows are projected to dip by ₹{dip:,.2f} in the next 30 days. We recommend delaying this purchase.",
        "scheme_info": "Your best government match is the '{scheme}' offering up to {subsidy}% subsidy."
    },
    "mr": {
        "loan_eligible": "होय, तुमचा बिझनेस हेल्थ स्कोर {score}/100 आहे, जो कर्जासाठी चांगला आहे. तुम्ही ₹{amt:,.2f} पर्यंत कर्ज अर्ज करू शकता.",
        "loan_not_eligible": "सध्या तुमचा आर्थिक ताण जास्त आहे. नवीन कर्ज घेण्यापूर्वी जुने कर्ज फेडण्याचा प्रयत्न करा.",
        "score_info": "तुमचा बिझनेस हेल्थ स्कोर {score}/100 आहे आणि जोखीम पातळी {level} आहे.",
        "equipment_yes": "होय, पुढील ३० दिवसांचे कॅश फ्लो पूर्वानुमान मजबूत आहे. तुम्ही नवीन उपकरणे खरेदी करू शकता.",
        "equipment_no": "कृपया थांबा. पुढील ३० दिवसांत कॅश फ्लो मध्ये ₹{dip:,.2f} ची घट होण्याची शक्यता आहे.",
        "scheme_info": "तुमच्यासाठी सर्वात योग्य योजना '{scheme}' आहे, ज्यामध्ये {subsidy}% सबसिडी मिळू शकते."
    }
}

class VoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.risk_service = RiskService(db)
        self.forecasting_service = ForecastingService(db)
        self.scheme_service = RecommendationService(db)

    async def handle_multilingual_voice_query(
        self,
        business_id: uuid.UUID,
        req: VoiceQueryRequest
    ) -> VoiceQueryResponse:
        """
        Module 12: Processes spoken rural vernacular questions (or text fallbacks),
        interrogates backend analytics, and returns translated audio/text suggestions.
        """
        lang = req.language if req.language in TRANSLATIONS else "en"
        lang_dict = TRANSLATIONS[lang]

        # 1. Transcribe (Speech to Text)
        # In production, this calls a speech-to-text API like Whisper
        # Here we mock transcript parsing based on voice base64 presence or textual request
        query_text = req.text_query or ""
        if req.audio_base64 and not query_text:
            query_text = "can i take a loan" # default voice mock transcription

        normalized_query = query_text.lower()
        
        # 2. Collect business indicators
        risk = await self.risk_service.evaluate_risk(business_id)
        forecast = await self.forecasting_service.generate_cash_flow_forecast(business_id, horizon_days=30)
        schemes = await self.scheme_service.match_government_schemes(business_id)

        # 3. Formulate response based on query intent
        response_msg = ""
        
        if any(w in normalized_query for w in ["loan", "credit", "borrow", "कर्ज", "ऋण"]):
            if risk.health_score >= 60:
                max_loan = float(risk.evidence.get("historical_inflows", 100000.0)) * 0.40
                response_msg = lang_dict["loan_eligible"].format(score=risk.health_score, amt=max_loan)
            else:
                response_msg = lang_dict["loan_not_eligible"]
                
        elif any(w in normalized_query for w in ["score", "rating", "risk", "हेल्थ"]):
            response_msg = lang_dict["score_info"].format(score=risk.health_score, level=risk.risk_level)
            
        elif any(w in normalized_query for w in ["equipment", "buy", "purchase", "मशीन", "उपकरण"]):
            negative_days = [p for p in forecast.forecast_points if p.predicted_net_cash_flow < 0]
            if negative_days:
                worst_dip = abs(min([p.predicted_net_cash_flow for p in negative_days]))
                response_msg = lang_dict["equipment_no"].format(dip=worst_dip)
            else:
                response_msg = lang_dict["equipment_yes"]
                
        elif any(w in normalized_query for w in ["scheme", "subsidy", "yojana", "योजना", "सबसिडी"]):
            if schemes.matches:
                top_scheme = schemes.matches[0].scheme
                response_msg = lang_dict["scheme_info"].format(
                    scheme=top_scheme.name, 
                    subsidy=int(top_scheme.subsidy_percentage or 0)
                )
            else:
                response_msg = "Currently no specific government subsidies matched your profile."
        else:
            response_msg = (
                "Hello, I am your RuralOS Financial Assistant. "
                "You can ask me questions about loans, credit ratings, buying machinery, or government schemes."
                if lang == "en" else
                "नमस्ते, मैं आपका रूरलओएस सहायक हूँ। आप मुझसे ऋण, क्रेडिट स्कोर, उपकरण खरीदने या सरकारी योजनाओं के बारे में पूछ सकते हैं।"
            )

        # 4. Generate dummy audio bytes representing Text-to-Speech (TTS)
        # Returns simple base64 placeholder audio bytes
        audio_placeholder = "UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA=="

        return VoiceQueryResponse(
            language=lang,
            original_transcript=query_text,
            agent_text_response=response_msg,
            audio_response_base64=audio_placeholder
        )
