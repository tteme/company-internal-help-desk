import { useSelector } from "react-redux";

function Profile() {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  const roleLabel = user.role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <section>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Profile
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          View your account information.
        </p>
      </header>

      <section
        aria-labelledby="personal-information-heading"
        className="mt-6 max-w-3xl rounded-lg border border-border bg-surface"
      >
        <header className="border-b border-border px-6 py-5">
          <h2
            id="personal-information-heading"
            className="text-base font-semibold text-text"
          >
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Your current employee account details.
          </p>
        </header>

        <dl className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">
              First Name
            </dt>

            <dd className="mt-1 text-sm text-text">{user.firstName}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-text-secondary">
              Last Name
            </dt>

            <dd className="mt-1 text-sm text-text">{user.lastName}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-text-secondary">
              Employee ID
            </dt>

            <dd className="mt-1 text-sm text-text">{user.employeeId || "—"}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-text-secondary">Email</dt>

            <dd className="mt-1 text-sm text-text">{user.email || "—"}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-text-secondary">Phone</dt>

            <dd className="mt-1 text-sm text-text">{user.phone || "—"}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-text-secondary">Role</dt>

            <dd className="mt-1 text-sm text-text">{roleLabel}</dd>
          </div>
        </dl>
      </section>
    </section>
  );
}

export default Profile;
