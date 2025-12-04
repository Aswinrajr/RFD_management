const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    // FIX: Using 'gemini-2.5-flash' or 'gemini-pro' (without the 'models/' prefix) 
    // is the correct identifier for the current SDK version.
    
    // 'gemini-2.5-flash' is the recommended, fastest, and most cost-effective model for parsing tasks.
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // You can also use 'gemini-pro' if you need the older model's capabilities:
    // this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // Parse natural language input into structured RFP
  async parseRFPFromNaturalLanguage(naturalLanguageInput) {
    try {
      const prompt = `You are an expert procurement assistant. Parse the following natural language request into a structured RFP format.

Natural Language Input:
"${naturalLanguageInput}"

Extract and return a JSON object with the following structure:
{
  "title": "Brief title for the RFP",
  "description": "Detailed description",
  "budget": {
    "amount": numerical_value,
    "currency": "USD"
  },
  "requirements": [
    {
      "item": "item name",
      "quantity": number,
      "specifications": "specifications"
    }
  ],
  "deliveryTimeline": {
    "value": number,
    "unit": "days/weeks/months"
  },
  "paymentTerms": "payment terms like Net 30",
  "warranty": "warranty requirements",
  "additionalTerms": "any additional terms"
}

Return ONLY valid JSON, no additional text or explanations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsedRFP = JSON.parse(jsonText);
      return parsedRFP;
    } catch (error) {
      console.error('Error parsing RFP with AI:', error);
      throw new Error('Failed to parse RFP from natural language');
    }
  }

  // Parse vendor response email into structured proposal
  async parseVendorResponse(emailContent, rfpDetails) {
    try {
      const prompt = `You are an expert procurement assistant. Parse the following vendor response email into a structured proposal format.

RFP Details:
${JSON.stringify(rfpDetails, null, 2)}

Vendor Response Email:
"${emailContent}"

Extract and return a JSON object with the following structure:
{
  "pricing": {
    "totalAmount": numerical_value,
    "currency": "USD",
    "breakdown": [
      {
        "item": "item name",
        "unitPrice": number,
        "quantity": number,
        "totalPrice": number
      }
    ]
  },
  "deliveryTimeline": {
    "value": number,
    "unit": "days/weeks/months",
    "description": "any additional details"
  },
  "paymentTerms": "payment terms offered",
  "warranty": "warranty offered",
  "additionalTerms": "any additional terms or conditions",
  "complianceScore": number_0_to_100,
  "summary": "Brief summary of the proposal"
}

The complianceScore should indicate how well this proposal meets the RFP requirements (0-100).
Return ONLY valid JSON, no additional text or explanations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsedProposal = JSON.parse(jsonText);
      return parsedProposal;
    } catch (error) {
      console.error('Error parsing vendor response with AI:', error);
      throw new Error('Failed to parse vendor response');
    }
  }

  // Compare proposals and provide AI recommendation
  async compareProposalsAndRecommend(rfpDetails, proposals) {
    try {
      const proposalsData = proposals.map(p => ({
        vendorName: p.vendorId.name,
        vendorCompany: p.vendorId.company,
        totalAmount: p.pricing.totalAmount,
        deliveryTimeline: p.deliveryTimeline,
        paymentTerms: p.paymentTerms,
        warranty: p.warranty,
        complianceScore: p.complianceScore,
        summary: p.aiSummary
      }));

      const prompt = `You are an expert procurement analyst. Compare the following vendor proposals for an RFP and provide recommendations.

RFP Details:
${JSON.stringify(rfpDetails, null, 2)}

Vendor Proposals:
${JSON.stringify(proposalsData, null, 2)}

Provide a detailed comparison and recommendation in the following JSON format:
{
  "overallRecommendation": "Which vendor to choose and why (2-3 sentences)",
  "vendorScores": [
    {
      "vendorName": "vendor name",
      "overallScore": number_0_to_100,
      "priceScore": number_0_to_100,
      "timelineScore": number_0_to_100,
      "complianceScore": number_0_to_100,
      "pros": ["list of pros"],
      "cons": ["list of cons"]
    }
  ],
  "keyFindings": [
    "Important finding 1",
    "Important finding 2",
    "Important finding 3"
  ],
  "riskFactors": [
    "Risk factor 1 if any",
    "Risk factor 2 if any"
  ]
}

Return ONLY valid JSON, no additional text or explanations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const comparison = JSON.parse(jsonText);
      return comparison;
    } catch (error) {
      console.error('Error comparing proposals with AI:', error);
      throw new Error('Failed to compare proposals');
    }
  }
}

module.exports = new AIService();