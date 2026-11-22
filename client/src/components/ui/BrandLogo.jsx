// Shared approved TypeFlow artwork for public and authenticated navigation.

/**
 * Display the original lockup in stable bounds without its transparent padding.
 * Dark mode lightens the wordmark alone; both layers reuse one cached PNG.
 * The mark keeps its English orientation inside either interface language.
 */
export function BrandLogo() {
  return (
    <span className="brand-logo" role="img" aria-label="TypeFlow" lang="en" dir="ltr">
      <img
        src="/brand/typeflow-logo.png"
        width="2172"
        height="724"
        alt=""
        aria-hidden="true"
      />
      <img
        className="brand-logo__dark-wordmark"
        src="/brand/typeflow-logo.png"
        width="2172"
        height="724"
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}
