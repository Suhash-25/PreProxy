// Intercept navigation events before they reach the real system 
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId !== 0) return; // Only intercept main tab navigation

    const targetUrl = details.url;

    // Skip if it's already our backend or an internal page
    if (targetUrl.startsWith("chrome://") || targetUrl.includes("localhost")) return;

    console.log("Pre-execution check for:", targetUrl);

    // Call the POSSE Engine [cite: 105]
    try {
        const response = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl })
        });
        
        const result = await response.json();

        if (result.verdict === "BLOCK") {
            // Enforcement: Block execution [cite: 116, 137]
            chrome.tabs.update(details.tabId, { url: "data:text/html,<h1>Blocked by PreProxy</h1><p>Malicious intent detected.</p>" });
        }
    } catch (error) {
        console.error("Security Engine Offline:", error);
    }
});