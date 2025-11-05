let className = "";
let assignmentName = "";

export function getInfo() {
    assignmentName = document.querySelectorAll("#breadcrumbs li")[3].innerText;
    console.log(assignmentName);

    const classStr = document.querySelectorAll("#breadcrumbs li")[1].innerText;

    const classCodeRegex = /([A-Za-z]{3,5})?\s(\d{3}[A-Za-z]?)/;
    const match = classStr.match(classCodeRegex);

    if (match) {
        className = match[1] + match[2];
    } else {
        className = classStr;
    }
    console.log(className);
}