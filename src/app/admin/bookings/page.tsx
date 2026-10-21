import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isMissingRelationError } from "@/lib/db-errors";
import { formatPurchaseAmount, stripeDashboardSessionUrl } from "@/lib/launch-checkout";
import {
  LAUNCH_SETUP_LABEL,
  LAUNCH_SETUP_SERVICE,
  launchSetupPath,
} from "@/lib/launch-booking-shared";

export default async function AdminBookingsPage() {
  const email = await getAdminSession();

  if (!email) {
    redirect("/admin/login");
  }

  const now = new Date();
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "cerpamedia.com";
  const proto = headerList.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;

  let launchPurchases: Array<{
    id: string;
    tier: string;
    amountTotal: number | null;
    currency: string;
    buyerName: string | null;
    buyerEmail: string | null;
    buyerPhone: string | null;
    promoCode: string | null;
    stripeSessionId: string;
    bookingToken: string;
    livemode: boolean;
    createdAt: Date;
    adminNotifiedAt: Date | null;
    booking: { id: string; startTime: Date; status: string; platformPref: string } | null;
  }> = [];
  let launchTableReady = true;
  try {
    launchPurchases = await prisma.launchPurchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        booking: {
          select: { id: true, startTime: true, status: true, platformPref: true },
        },
      },
    });
  } catch (error) {
    if (!isMissingRelationError(error)) throw error;
    launchTableReady = false;
  }
  
  const bookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      startTime: { gte: now },
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      customerCompany: true,
      serviceInterest: true,
      platformPref: true,
      notes: true,
      intakeAnswers: true,
    },
  });

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Confirmed
      </span>
    );
  };

  const serviceLabels: Record<string, string> = {
    general: "Technology Strategy Call (general)",
    web_mobile: "Web & mobile applications",
    ai: "AI integration / AI consulting",
    automation: "Automation & process improvement",
    strategy: "Strategy / architecture / roadmap",
    not_sure: "Not sure yet",
    [LAUNCH_SETUP_SERVICE]: LAUNCH_SETUP_LABEL,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                CerpaMedia Admin
              </Link>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">Bookings</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{email}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upcoming Bookings
          </h2>
          <p className="text-gray-600">
            View and manage consultation bookings ({bookings.length} upcoming)
          </p>
        </div>

        <LaunchClients
          ready={launchTableReady}
          purchases={launchPurchases}
          origin={origin}
          formatDateTime={formatDateTime}
        />

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Upcoming Bookings
            </h3>
            <p className="text-gray-600">
              There are no upcoming bookings at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {getStatusBadge(booking.status)}
                        {booking.serviceInterest === LAUNCH_SETUP_SERVICE && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {LAUNCH_SETUP_LABEL}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">ID: {booking.id}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.customerName}</h3>
                      <p className="text-sm text-gray-600">{booking.customerCompany}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(booking.startTime)}
                      </p>
                      <p className="text-sm text-gray-500">{booking.platformPref || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">
                          <a
                            href={`mailto:${booking.customerEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {booking.customerEmail}
                          </a>
                        </p>
                        {booking.customerPhone ? (
                          <p className="text-sm text-gray-900">
                            <a
                              href={`tel:${booking.customerPhone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {booking.customerPhone}
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Service Interest
                      </h4>
                      <p className="text-sm text-gray-900">
                        {serviceLabels[booking.serviceInterest] || booking.serviceInterest}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Challenge / Problem Statement
                    </h4>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {booking.notes || <span className="text-gray-400 italic">No notes</span>}
                    </p>
                  </div>

                  {booking.intakeAnswers && typeof booking.intakeAnswers === 'object' && Object.keys(booking.intakeAnswers).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Additional Context
                      </h4>
                      <div className="bg-gray-50 rounded p-4 space-y-2">
                        {Object.entries(booking.intakeAnswers as Record<string, any>).filter(([_, value]) => value).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-gray-700">{key.replace(/_/g, ' ')}:</span>{" "}
                            <span className="text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LaunchClients({
  ready,
  purchases,
  origin,
  formatDateTime,
}: {
  ready: boolean;
  purchases: Array<{
    id: string;
    tier: string;
    amountTotal: number | null;
    currency: string;
    buyerName: string | null;
    buyerEmail: string | null;
    buyerPhone: string | null;
    promoCode: string | null;
    stripeSessionId: string;
    bookingToken: string;
    livemode: boolean;
    createdAt: Date;
    booking: { id: string; startTime: Date; status: string; platformPref: string } | null;
  }>;
  origin: string;
  formatDateTime: (date: Date) => string;
}) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Teammate Launch clients</h3>
      <p className="text-sm text-gray-600 mb-4">
        Purchases from the founding and regular payment links. Scheduling links stay off the public site.
      </p>
      {!ready ? (
        <div className="bg-white shadow rounded-lg p-6 text-sm text-gray-600">
          Launch purchases will show here after the database migration is applied.
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-sm text-gray-600">
          No Launch purchases yet.
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const scheduleUrl = `${origin}${launchSetupPath(purchase.bookingToken)}`;
            const dashboardUrl = stripeDashboardSessionUrl(purchase.stripeSessionId, purchase.livemode);
            const scheduled = purchase.booking && purchase.booking.status !== "cancelled";
            return (
              <div key={purchase.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {LAUNCH_SETUP_LABEL}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {purchase.tier} · {formatPurchaseAmount(purchase.amountTotal, purchase.currency)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scheduled ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {scheduled ? "Setup session booked" : "Needs scheduling"}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {purchase.buyerName || "Name not provided"}
                </h4>
                <p className="text-sm text-gray-600">{purchase.buyerEmail || "Email not provided"}</p>
                {purchase.buyerPhone ? (
                  <p className="text-sm text-gray-600">{purchase.buyerPhone}</p>
                ) : null}
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Purchased</dt>
                    <dd className="text-gray-900">{formatDateTime(purchase.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Promo code</dt>
                    <dd className="text-gray-900">{purchase.promoCode || "None"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Stripe session</dt>
                    <dd>
                      <a href={dashboardUrl} className="text-blue-600 hover:underline break-all">
                        {purchase.stripeSessionId}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Setup session</dt>
                    <dd className="text-gray-900">
                      {scheduled && purchase.booking
                        ? `${formatDateTime(purchase.booking.startTime)} · ${purchase.booking.platformPref}`
                        : "Not scheduled"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-gray-700">
                  Next step: Send the intake form within 1 business day.
                </p>
                <p className="mt-2 text-sm break-all">
                  <a href={scheduleUrl} className="text-blue-600 hover:underline">
                    {scheduleUrl}
                  </a>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
