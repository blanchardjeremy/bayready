import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icons can't be transparent, so the tag sits on the site's fog color.
const TAG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#B83A1E" fill-rule="evenodd" d="M11 5h17a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H11L1.5 16Z M8.5 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#E9EEF0" }}>
        <img src={`data:image/svg+xml,${encodeURIComponent(TAG)}`} width={128} height={128} alt="" />
      </div>
    ),
    size,
  );
}
