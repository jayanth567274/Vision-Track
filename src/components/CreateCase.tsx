import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CreateCaseProps {
  onCaseCreated: (caseId: string) => void;
}

export function CreateCase({ onCaseCreated }: CreateCaseProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Reporter Information
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    reporterRelation: "",
    
    // Missing Person Details
    personName: "",
    age: "",
    gender: "",
    height: "",
    bodyType: "",
    
    // Last Known Information
    lastSeenLocation: "",
    lastSeenDate: "",
    lastSeenTime: "",
    clothingDescription: "",
    
    // Additional Information
    identifyingFeatures: [] as string[],
    languagesSpoken: [] as string[],
    behavioralPatterns: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCase = useMutation(api.cases.createCase);
  const generateUploadUrl = useMutation(api.cases.generateUploadUrl);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field: "identifyingFeatures" | "languagesSpoken", value: string) => {
    const items = value.split(",").map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
    }
    
    setSelectedImage(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let photoId = undefined;

      // Upload photo if selected
      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        photoId = json.storageId;
      }

      // Create the case
      const result = await createCase({
        ...formData,
        age: parseInt(formData.age),
        photoId,
      });

      toast.success("📧 Case created successfully! Check your email for confirmation.");
      onCaseCreated(result.caseId);
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.reporterName && formData.reporterEmail && formData.reporterRelation;
      case 2:
        return formData.personName && formData.age && formData.gender;
      case 3:
        return formData.lastSeenLocation && formData.lastSeenDate && formData.lastSeenTime;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Missing Person Case</h2>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {num}
                </div>
                {num < 4 && <div className={`w-8 h-1 ${step > num ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          {formData.reporterEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>📧 Email Notifications:</strong> Updates will be sent to <strong>{formData.reporterEmail}</strong>
              </p>
            </div>
          )}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚖️ Important:</strong> This system provides AI-assisted analysis for decision support only. 
              Always contact local authorities and follow official procedures for missing person cases.
            </p>
          </div>
        </div>

        {step === 1 && (
          <ReporterInformation 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}

        {step === 2 && (
          <PersonDetails 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}

        {step === 3 && (
          <LastKnownInformation 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}

        {step === 4 && (
          <AdditionalInformation 
            formData={formData} 
            onChange={handleInputChange}
            onArrayChange={handleArrayInput}
            selectedImage={selectedImage}
            onImageChange={handleImageChange}
          />
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid(step)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid(1) || !isStepValid(2) || !isStepValid(3)}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Case..." : "Create Case"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReporterInformation({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Reporter Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Full Name *
        </label>
        <input
          type="text"
          value={formData.reporterName}
          onChange={(e) => onChange("reporterName", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.reporterEmail}
          onChange={(e) => onChange("reporterEmail", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your.email@example.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          📧 We'll send case updates and analysis results to this email
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={formData.reporterPhone}
          onChange={(e) => onChange("reporterPhone", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="+1 (555) 123-4567"
        />
        <p className="text-xs text-gray-500 mt-1">
          📱 Optional: For urgent notifications and updates
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship to Missing Person *
        </label>
        <select
          value={formData.reporterRelation}
          onChange={(e) => onChange("reporterRelation", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select relationship</option>
          <option value="parent">Parent</option>
          <option value="spouse">Spouse/Partner</option>
          <option value="sibling">Sibling</option>
          <option value="child">Child</option>
          <option value="friend">Friend</option>
          <option value="caregiver">Caregiver</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
}

function PersonDetails({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Missing Person Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.personName}
          onChange={(e) => onChange("personName", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Missing person's full name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Age"
            min="0"
            max="120"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height
          </label>
          <input
            type="text"
            value={formData.height}
            onChange={(e) => onChange("height", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 5'6&quot; or 168cm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Body Type
          </label>
          <select
            value={formData.bodyType}
            onChange={(e) => onChange("bodyType", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select body type</option>
            <option value="slim">Slim</option>
            <option value="average">Average</option>
            <option value="athletic">Athletic</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function LastKnownInformation({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Last Known Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Last Seen Location *
        </label>
        <input
          type="text"
          value={formData.lastSeenLocation}
          onChange={(e) => onChange("lastSeenLocation", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Address, landmark, or area description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Last Seen *
          </label>
          <input
            type="date"
            value={formData.lastSeenDate}
            onChange={(e) => onChange("lastSeenDate", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Last Seen *
          </label>
          <input
            type="time"
            value={formData.lastSeenTime}
            onChange={(e) => onChange("lastSeenTime", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clothing Description
        </label>
        <textarea
          value={formData.clothingDescription}
          onChange={(e) => onChange("clothingDescription", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Describe what they were wearing when last seen"
        />
      </div>
    </div>
  );
}

function AdditionalInformation({ formData, onChange, onArrayChange, selectedImage, onImageChange }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recent Photo
        </label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedImage && (
            <div className="relative inline-block">
              <img 
                src={URL.createObjectURL(selectedImage)} 
                alt="Preview" 
                className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => onImageChange(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500">
            📸 Upload a clear, recent photo. Supported formats: JPG, PNG, GIF (max 10MB)
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Identifying Features
        </label>
        <input
          type="text"
          onChange={(e) => onArrayChange("identifyingFeatures", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Scars, tattoos, glasses, etc. (separate with commas)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages Spoken
        </label>
        <input
          type="text"
          onChange={(e) => onArrayChange("languagesSpoken", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="English, Spanish, etc. (separate with commas)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Behavioral Patterns
        </label>
        <textarea
          value={formData.behavioralPatterns}
          onChange={(e) => onChange("behavioralPatterns", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Routine routes, habits, medical conditions, mental state, etc."
        />
      </div>
    </div>
  );
}
