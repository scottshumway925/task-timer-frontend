let className = "";
let assignmentName = "";

export function getInfo() {
  try {
    
    // Use querySelector for robustness, innerText.trim() to clean.
    const assignmentNode = document.querySelector("#breadcrumbs li:nth-child(4) .ellipsible");
    assignmentName = assignmentNode ? assignmentNode.innerText.trim() : "Unknown Assignment";
    console.log(assignmentName);

    const classNode = document.querySelector("#breadcrumbs li:nth-child(2) .ellipsible");
    const classStr = classNode ? classNode.innerText.trim() : "Unknown Class";

    const classCodeRegex = /([A-Za-z]{3,5})?\s(\d{3}[A-Za-z]?)/;
    const match = classStr.match(classCodeRegex);

    if (match && match[1] && match[2]) {
      // Re-combine to get a clean code like 'FD100' or 'CS210'
      className = (match[1] || '') + match[2];
    } else {
      // Fallback to the full string if regex fails
      className = classStr;
    }
    console.log(className);

  } catch (e) {
    console.error("Error scraping breadcrumbs:", e);
    // Set fallbacks if DOM structure is not as expected
    assignmentName = "Unknown Assignment";
    className = "Unknown Class";
  }

  return { assignmentName, className };
}