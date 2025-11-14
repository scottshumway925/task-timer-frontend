let className = "";
let assignmentName = "";
let courseId = "";
let assignmentId = "";

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

    // Extract course and assignment IDs from URL
    const urlMatch = window.location.href.match(/courses\/(\d+)\/(assignments|quizzes)\/(\d+)/);
    if (urlMatch) {
        courseId = urlMatch[1];
        assignmentId = urlMatch[3];
    }
}

export function getClassName() {
    return className;
}

export function getAssignmentName() {
    return assignmentName;
}

export function getCourseId() {
    return courseId;
}

export function getAssignmentId() {
    return assignmentId;
}