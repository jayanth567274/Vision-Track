import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface CreateCaseProps {
  caseId?: Id<"cases"> | null;
  onCaseSaved: (caseId: Id<"cases">) => void;
}

export function CreateCase({ caseId, onCaseSaved }: CreateCaseProps) {
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
  const updateCase = useMutation(api.cases.updateCase);
  const generateUploadUrl = useMutation(api.cases.generateUploadUrl);
    const caseToEdit = useQuery(
    api.cases.getCase,
    caseId ? { caseId } : "skip"
  );
  const [hasLoadedEditValues, setHasLoadedEditValues] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field: "identifyingFeatures" | "languagesSpoken", value: string) => {
    const items = value.split(",").map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  useEffect(() => {
    if (!caseToEdit || hasLoadedEditValues) return;

    setFormData({
      reporterName: caseToEdit.reporterName || "",
      reporterEmail: caseToEdit.reporterEmail || "",
      reporterPhone: caseToEdit.reporterPhone || "",
      reporterRelation: caseToEdit.reporterRelation || "",
      personName: caseToEdit.personName || "",
      age: caseToEdit.age ? String(caseToEdit.age) : "",
      gender: caseToEdit.gender || "",
      height: caseToEdit.height || "",
      bodyType: caseToEdit.bodyType || "",
      lastSeenLocation: caseToEdit.lastSeenLocation || "",
      lastSeenDate: caseToEdit.lastSeenDate || "",
      lastSeenTime: caseToEdit.lastSeenTime || "",
      clothingDescription: caseToEdit.clothingDescription || "",
      identifyingFeatures: caseToEdit.identifyingFeatures || [],
      languagesSpoken: caseToEdit.languagesSpoken || [],
      behavioralPatterns: caseToEdit.behavioralPatterns || "",
    });
    setHasLoadedEditValues(true);
  }, [caseToEdit, hasLoadedEditValues]);

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

      const result = caseId
        ? await updateCase({
            caseId,
            ...formData,
            age: parseInt(formData.age),
            photoId,
          })
        : await createCase({
            ...formData,
            age: parseInt(formData.age),
            photoId,
          });

      if (caseId) {
        toast.success("Case updated successfully.");
      } else if ("emailSent" in result && result.emailSent) {
        toast.success("Case created successfully. Check your email for confirmation.");
      } else {
        toast.success("Case created successfully. Email notifications are not configured, so no confirmation email was sent.");
      }
      onCaseSaved(result.caseId);
    } catch (error) {
      console.error("Error saving case:", error);
      const message = error instanceof Error ? error.message : "Please try again.";
      toast.error(`Failed to ${caseId ? "save changes" : "create case"}. ${message}`);
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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {caseId ? "Edit Missing Person Case" : "Report Missing Person"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {caseId ? "Update the case details and save changes." : "Complete the form to create a new case."}
          </p>
          
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-4 gap-3 text-xs uppercase tracking-[0.22em] font-semibold text-slate-500 dark:text-slate-400">
              {[
                { id: 1, label: "Reporter" },
                { id: 2, label: "Person" },
                { id: 3, label: "Last Seen" },
                { id: 4, label: "Details" },
              ].map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full grid place-items-center text-sm font-semibold transition ${
                    step === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : step > item.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  }`}>
                    {item.id}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            </div>
          </div>

          {formData.reporterEmail && (
            <div className="bg-blue-50 dark:bg-blue-900/25 border border-blue-200 dark:border-blue-800 rounded-3xl p-4 mb-4 backdrop-blur-sm">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>📧 Email Notifications:</strong> Updates will be sent to <strong>{formData.reporterEmail}</strong>
              </p>
            </div>
          )}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-4 backdrop-blur-sm">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>⚖️ Important:</strong> This system provides AI-assisted analysis for decision support only. Always contact local authorities and follow official procedures for missing person cases.
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

        <div className="flex justify-between mt-10 gap-4">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            ← Previous
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid(step)}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid(1) || !isStepValid(2) || !isStepValid(3)}
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting
                ? caseId ? "Saving Changes..." : "Creating Case..."
                : caseId ? "✓ Save Changes" : "✓ Create Case"}
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
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="text-2xl">👤</span> Reporter Information
      </h3>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Your Full Name *
        </label>
        <input
          type="text"
          value={formData.reporterName}
          onChange={(e) => onChange("reporterName", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="John Smith"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.reporterEmail}
          onChange={(e) => onChange("reporterEmail", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="your.email@example.com"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          📧 We'll send case updates and analysis results to this email
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={formData.reporterPhone}
          onChange={(e) => onChange("reporterPhone", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="+1 (555) 123-4567"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          📱 Optional: For urgent notifications and updates
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Relationship to Missing Person *
        </label>
        <select
          value={formData.reporterRelation}
          onChange={(e) => onChange("reporterRelation", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="text-2xl">👥</span> Missing Person Details
      </h3>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.personName}
          onChange={(e) => onChange("personName", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Full name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Age"
            min="0"
            max="120"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Gender *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
            <div className="space-y-3">
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

