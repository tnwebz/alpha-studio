import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useSiteAssets } from "@/hooks/useSiteAssets";
import { AdminUploadModal } from "./AdminUploadModal";

const defaultSocialLinks = [
  { id: "1", name: "Instagram", href: "https://www.instagram.com/stories_by_alpha?stkn=MW0zMGY5eXUweDYwYg%3D%3D&utm_source=qr" },
  { id: "2", name: "WhatsApp", href: "https://wa.me/919629238744" },
];

const projectTypeOptions = [
  "Wedding Photography",
  "Baby Photoshoot",
  "Maternity Session",
  "Outdoor Portraits",
  "Events",
  "Other",
];

export function ContactSection() {
  const { isAdmin } = useAdmin();
  const { assets, updateContactBackground, resetAsset } = useSiteAssets();
  const [modalOpen, setModalOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
    projectType: [] as string[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (type: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      projectType: checked
        ? [...prev.projectType, type]
        : prev.projectType.filter((t) => t !== type),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message, projectType } = formData;
    const text = `Hi, I am ${name}.\nEmail: ${email}\nLooking for: ${projectType.join(', ') || 'General Enquiry'}\n\nMessage: ${message}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/919629238744?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    setFormData({ name: "", email: "", message: "", projectType: [] });
  };

  const bgImage = assets.contactBackground || "/hero.png";

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D111B]/85 via-black/75 to-black/85" />

      {/* Admin Change Background Button */}
      {isAdmin && (
        <div className="absolute top-6 right-6 z-30">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#681C2B]/60 bg-[#3D111B]/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#681C2B] hover:scale-105"
          >
            <Camera className="h-3.5 w-3.5 text-[#DCC9B6]" />
            <span>Admin: Change Background (Cloudinary)</span>
          </button>
        </div>
      )}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="animate-bubble absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 20 + 10}px`,
                height: `${Math.random() * 20 + 10}px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 14 + 10}s`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-12 sm:gap-8 sm:px-8 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-14 lg:py-20">
        <div className="flex flex-col justify-center p-2 sm:p-4 lg:p-8 text-white space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DCC9B6]">Alpha stories studio</span>
            <h2 className="mt-2 font-serif text-[clamp(1.75rem,5vw,3.5rem)] leading-tight text-[#FAF6F0] drop-shadow-lg">
              Turning Moments Into Timeless Art
            </h2>
            <p className="mt-2 text-sm text-[#DCC9B6]">Contact: <strong className="text-white">Alwin.E</strong></p>
          </div>

          <div className="space-y-4 rounded-2xl bg-[#3D111B]/60 backdrop-blur-md p-5 sm:p-6 border border-[#DCC9B6]/30 text-sm shadow-xl">
            <div>
              <p className="text-xs uppercase font-semibold text-[#DCC9B6] tracking-wider">Studio Address</p>
              <p className="text-[#FAF6F0] mt-1 font-medium">Name: Alwin.E</p>
              <p className="text-zinc-200">NO: 45/1108/D Thimmavaram,</p>
              <p className="text-zinc-200">Kanchipuram high road,</p>
              <p className="text-zinc-200">Chengalpattu - 603 001</p>
              <p className="text-xs text-[#DCC9B6] mt-1.5 font-medium">Landmark: Near VAO office thimmavaram</p>
            </div>
            <hr className="border-[#DCC9B6]/20" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <div>
                <span className="text-[#DCC9B6]">Email: </span>
                <a href="mailto:alphastoriesstudio@gmail.com" className="text-white hover:underline">alphastoriesstudio@gmail.com</a>
              </div>
              <div>
                <span className="text-[#DCC9B6]">WhatsApp / Call: </span>
                <a href="https://wa.me/919629238744" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">+91 96292 38744</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#DCC9B6] bg-[#FAF6F0] p-5 shadow-2xl sm:p-6 md:p-8">
          <h3 className="text-xl font-bold text-[#241F20] sm:text-2xl font-serif">
            Get in touch
          </h3>

          <div className="mt-6">
            <p className="mb-1 text-sm text-[#746A67]">Mail us at</p>
            <a
              href="mailto:alphastoriesstudio@gmail.com"
              className="font-medium text-[#681C2B] hover:text-[#3D111B] hover:underline"
            >
              alphastoriesstudio@gmail.com
            </a>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-sm text-[#746A67]">OR</span>
              {defaultSocialLinks.map((link) => (
                <Button key={link.id} variant="outline" size="default" className="border-[#DCC9B6] bg-white text-[#241F20] hover:bg-[#DCC9B6]/30 hover:text-[#681C2B]" asChild>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.name}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <hr className="my-6 border-[#DCC9B6]/40" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-[#746A67]">Leave us a brief message</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#241F20]">Your name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-[#DCC9B6] bg-white text-[#241F20] focus:ring-[#681C2B] focus:border-[#681C2B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#241F20]">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-[#DCC9B6] bg-white text-[#241F20] focus:ring-[#681C2B] focus:border-[#681C2B]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-[#241F20]">Your message</Label>
              <Textarea
                id="message"
                name="message"
                className="min-h-[100px] border-[#DCC9B6] bg-white text-[#241F20] focus:ring-[#681C2B] focus:border-[#681C2B]"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#746A67]">I&apos;m looking for...</p>
              <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
                {projectTypeOptions.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <Checkbox
                      id={option}
                      checked={formData.projectType.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(option, checked)
                      }
                      className="border-[#DCC9B6] data-[state=checked]:bg-[#681C2B] data-[state=checked]:border-[#681C2B]"
                    />
                    <Label htmlFor={option} className="text-xs font-normal text-[#241F20]">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#681C2B] hover:bg-[#3D111B] text-white shadow-lg shadow-[#681C2B]/20 py-2.5 font-semibold uppercase tracking-wider">
              Send a message
            </Button>
          </form>
        </div>
      </div>

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Change Contact Section Background"
        currentImageUrl={bgImage}
        onUploadSuccess={(url) => updateContactBackground(url)}
        onResetToDefault={() => resetAsset("contactBackground")}
      />

      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(1.1); opacity: 0; }
        }
        .animate-bubble {
          animation: bubble 15s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
