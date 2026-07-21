import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { setInquiryStatusAction, deleteInquiryAction } from "../../actions";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { key: undefined, label: "All" },
  { key: "NEW", label: "New" },
  { key: "READ", label: "Read" },
  { key: "ARCHIVED", label: "Archived" },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const inquiries = await prisma.inquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { puppy: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Inquiries</h1>
      <p className="mt-1 text-muted">
        Messages from families interested in your puppies.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => {
          const active = status === t.key || (!status && !t.key);
          return (
            <Link
              key={t.label}
              href={t.key ? `/admin/inquiries?status=${t.key}` : "/admin/inquiries"}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-ink bg-ink text-bone"
                  : "border-line bg-paper text-ink-soft hover:border-clay/50"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {inquiries.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-12 text-center text-muted">
          No inquiries here yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {inquiries.map((inq) => (
            <article
              key={inq.id}
              className={`rounded-[var(--radius-xl)] border bg-paper p-5 sm:p-6 ${
                inq.status === "NEW" ? "border-clay/40" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {inq.name}
                    </h2>
                    {inq.status === "NEW" && (
                      <span className="rounded-full bg-clay px-2 py-0.5 text-[0.65rem] font-bold text-bone">
                        NEW
                      </span>
                    )}
                    {inq.status === "ARCHIVED" && (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[0.65rem] font-bold text-ink-soft">
                        ARCHIVED
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    <a href={`mailto:${inq.email}`} className="hover:text-clay">
                      {inq.email}
                    </a>
                    {inq.phone && <> · {inq.phone}</>}
                    {inq.puppy && (
                      <>
                        {" "}
                        ·{" "}
                        <Link
                          href={`/admin/puppies/${inq.puppy.id}/edit`}
                          className="font-medium text-clay hover:underline"
                        >
                          re: {inq.puppy.name}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted">
                  {formatDate(inq.createdAt)}
                </time>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-bone px-4 py-3 text-sm leading-relaxed text-ink-soft">
                {inq.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${inq.email}?subject=Re: Your inquiry with Willowbrook`}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bone hover:bg-clay-deep"
                >
                  Reply by email
                </a>
                {inq.status !== "READ" && (
                  <StatusButton id={inq.id} status="READ" label="Mark read" />
                )}
                {inq.status !== "ARCHIVED" && (
                  <StatusButton id={inq.id} status="ARCHIVED" label="Archive" />
                )}
                {inq.status !== "NEW" && (
                  <StatusButton id={inq.id} status="NEW" label="Mark new" />
                )}
                <form action={deleteInquiryAction} className="ml-auto">
                  <input type="hidden" name="id" value={inq.id} />
                  <ConfirmSubmit
                    message="Delete this inquiry permanently?"
                    className="rounded-full px-3 py-2 text-sm text-muted hover:text-clay-deep"
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
}: {
  id: string;
  status: string;
  label: string;
}) {
  return (
    <form action={setInquiryStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay">
        {label}
      </button>
    </form>
  );
}
