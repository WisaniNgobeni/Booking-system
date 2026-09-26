import { ImageResponse } from "next/og";

export const alt = "Smallbean online booking for service businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        <div style={{ width: "100%", height: "100%", display: "flex", padding: 58, backgroundColor: "#13241f", color: "#f7f7ef", fontFamily: "Georgia, serif" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "Arial, sans-serif", fontSize: 24, fontWeight: 700 }}>
                    <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#d3e37a", color: "#13241f", fontSize: 25, fontStyle: "italic" }}>s</div>
                    <span>smallbean<span style={{ color: "#d97056" }}>.</span></span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ color: "#d3e37a", fontFamily: "Arial, sans-serif", fontSize: 15, letterSpacing: 2 }}>ONLINE BOOKING FOR SERVICE BUSINESSES</div>
                    <div style={{ display: "flex", flexDirection: "column", fontSize: 70, lineHeight: 1.05 }}><span>Make room for</span><span style={{ color: "#d3e37a" }}>more good work.</span></div>
                    <div style={{ maxWidth: 590, color: "#c4ccc2", fontFamily: "Arial, sans-serif", fontSize: 21, lineHeight: 1.5 }}>One thoughtful link for your services, your real availability, and the people ready to book you.</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 18, borderTop: "1px solid #42514a", color: "#aeb8ad", fontFamily: "Arial, sans-serif", fontSize: 13 }}>
                    <span>South African service businesses</span><span>smallbeanstudio.com</span>
                </div>
            </div>
            <div style={{ width: 270, marginLeft: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 222, height: 440, padding: 10, display: "flex", border: "2px solid #819087", borderRadius: 34, backgroundColor: "#0e1713", transform: "rotate(4deg)" }}>
                    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", backgroundColor: "#f6f3eb", color: "#13241f", borderRadius: 25 }}>
                        <div style={{ width: 74, height: 14, alignSelf: "center", marginTop: -20, marginBottom: 29, borderRadius: "0 0 10px 10px", backgroundColor: "#0e1713" }} />
                        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: "#8a6844" }}>BOOK A VISIT</div>
                        <div style={{ marginTop: 9, display: "flex", flexDirection: "column", fontSize: 24, lineHeight: 1.1 }}><span>A good hair day</span><span>starts right here.</span></div>
                        <div style={{ marginTop: 22, padding: 10, display: "flex", justifyContent: "space-between", border: "1px solid #d9dbd1", fontFamily: "Arial, sans-serif", fontSize: 11 }}><span>Signature cut</span><span>R 350</span></div>
                        <div style={{ marginTop: 8, padding: 10, display: "flex", justifyContent: "space-between", border: "1px solid #d9dbd1", fontFamily: "Arial, sans-serif", fontSize: 11 }}><span>Wash &amp; style</span><span>R 420</span></div>
                        <div style={{ marginTop: 23, padding: 12, display: "flex", justifyContent: "space-between", backgroundColor: "#13241f", color: "white", fontFamily: "Arial, sans-serif", fontSize: 10 }}>Confirm booking <span style={{ color: "#d3e37a" }}>→</span></div>
                        <div style={{ marginTop: "auto", paddingTop: 12, color: "#738077", textAlign: "center", fontFamily: "Arial, sans-serif", fontSize: 8 }}>A little more time for you.</div>
                    </div>
                </div>
            </div>
        </div>,
        size,
    );
}