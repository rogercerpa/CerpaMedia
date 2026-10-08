import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "../TestimonialForm";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    redirect("/admin/testimonials");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/testimonials"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Testimonials
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Edit Testimonial</h1>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
