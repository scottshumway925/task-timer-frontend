import { db } from "./firebase.js";
import { collection, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

// Generate a unique student ID (stored in chrome storage)
async function getStudentId() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['studentId'], (data) => {
            if (data.studentId) {
                resolve(data.studentId);
            } else {
                // Generate a new unique ID
                const newId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                chrome.storage.sync.set({ studentId: newId }, () => {
                    resolve(newId);
                });
            }
        });
    });
}

/**
 * Write timing data to Firestore
 * @param {string} courseId - Canvas course ID
 * @param {string} assignmentId - Canvas assignment ID
 * @param {number} timeSeconds - Time spent in seconds
 * @param {string} assignmentName - Name of the assignment
 * @param {string} className - Name of the class
 */
export async function writeTimingData(courseId, assignmentId, timeSeconds, assignmentName, className) {
    try {
        const studentId = await getStudentId();
        const docId = `${courseId}_${assignmentId}`;
        
        // Write to assignment_times collection
        const timesRef = collection(db, 'assignment_times', docId, 'times');
        const studentDocRef = doc(timesRef, studentId);
        
        await setDoc(studentDocRef, {
            studentId: studentId,
            courseId: courseId,
            assignmentId: assignmentId,
            assignmentName: assignmentName,
            className: className,
            timeSeconds: timeSeconds,
            timestamp: serverTimestamp(),
            submittedAt: new Date().toISOString()
        });
        
        console.log('Successfully wrote timing data to Firestore');
        return true;
    } catch (error) {
        console.error('Error writing timing data to Firestore:', error);
        return false;
    }
}

/**
 * Listen for statistics updates from Firestore
 * @param {string} courseId - Canvas course ID
 * @param {string} assignmentId - Canvas assignment ID
 * @param {function} callback - Function to call with statistics data
 */
export function listenToStatistics(courseId, assignmentId, callback) {
    const docId = `${courseId}_${assignmentId}`;
    const statsRef = doc(db, 'assignment_statistics', docId);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(statsRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback(data);
        } else {
            console.log('No statistics available yet for this assignment');
            // Return default values
            callback({
                mean: 0,
                median: 0,
                mode: 0,
                count: 0
            });
        }
    }, (error) => {
        console.error('Error listening to statistics:', error);
    });
    
    return unsubscribe;
}

/**
 * Get statistics once (without listener)
 * @param {string} courseId - Canvas course ID
 * @param {string} assignmentId - Canvas assignment ID
 */
export async function getStatistics(courseId, assignmentId) {
    try {
        const docId = `${courseId}_${assignmentId}`;
        const statsRef = doc(db, 'assignment_statistics', docId);
        const docSnapshot = await getDoc(statsRef);
        
        if (docSnapshot.exists()) {
            return docSnapshot.data();
        } else {
            return {
                mean: 0,
                median: 0,
                mode: 0,
                count: 0
            };
        }
    } catch (error) {
        console.error('Error getting statistics:', error);
        return {
            mean: 0,
            median: 0,
            mode: 0,
            count: 0
        };
    }
}

