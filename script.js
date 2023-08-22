import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    // ... 
    apiKey: "AIzaSyAVvXSF1jI6KJ-uhQt7-g8Vl7NgI8gVP6A",
                authDomain: "login-signup-page-62d6d.firebaseapp.com",
                databaseURL: "https://login-signup-page-62d6d-default-rtdb.firebaseio.com",
                projectId: "login-signup-page-62d6d",
                storageBucket: "login-signup-page-62d6d.appspot.com",
                messagingSenderId: "136515271677",
                appId: "1:136515271677:web:eae6a08d0ddeaa57303794",
                measurementId: "G-3Q79PDVY8H"
    
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("button");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            submitButton.addEventListener("click", async () => {
                const heading = document.getElementById("headingPost").value;
                const description = document.getElementById("titlePost").value;
                
                if (description.length >= 50) {
                    await addBlogPost(user.uid, user.displayName, heading, description);
                    Swal.fire("Success", "Blog post added successfully.", "success");
                    document.getElementById("headingPost").value = "";
                    document.getElementById("titlePost").value = "";
                    displayUserPosts(user.uid);
                } else {
                    Swal.fire("Error", "Description must be at least 50 characters long.", "error");
                }
            });

            displayUserPosts(user.uid);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'User not logged in',
                text: 'You are not logged in. Please log in to continue.',
                confirmButtonText: 'Login',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });

            submitButton.style.display = "none";
        }
    });
});

async function addBlogPost(userId, userName, heading, description) {
    await addDoc(collection(db, "posts"), {
        userId: userId,
        userName: userName,
        heading: heading,
        description: description,
        imageUrl: imageUrl,
        createdAt: serverTimestamp()
    });
}
const postDisplay = document.getElementById("postDisplay");

async function displayUserPosts(userId) {
    postDisplay.innerHTML = ''; 
    
    try {
        const q = query(collection(db, "posts"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const postDiv = createPostDiv(data, doc.id , data.userName);
            postDisplay.appendChild(postDiv);
        });
    } catch (error) {
        console.error("Error fetching user's blog posts:", error);
    }
}

function createPostDiv(data, postId) {
    const postDiv = document.createElement('div');
    postDiv.classList.add("post");
    postDiv.innerHTML = `
        <div class="picture"><img src="${data.imageUrl}" alt="Blog Image"></div>
        <div class="heading">${data.heading}</div>
        <div class="information">${data.userName} - ${data.createdAt.toDate().toLocaleDateString()}</div>
        <div class="post-description">${data.description}</div>
        <button type="button" class="deleteButton" data-id="${postId}">Delete</button>
        <button type="button" class="editButton" data-id="${postId}">Edit</button>
    `;

    postDiv.querySelector('.deleteButton').addEventListener('click', () => {
        Swal.fire({
            icon: 'warning',
            title: 'Delete Post',
            text: 'Are you sure you want to delete this post?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deletePost(postId);
                Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
                postDiv.remove();
            }
        });
    });

    postDiv.querySelector('.editButton').addEventListener('click', () => {
        Swal.fire({
            title: 'Edit Post',
            html:
                `<input id="editHeading" class="swal2-input" placeholder="Heading" value="${data.heading}">
                <textarea id="editDescription" class="swal2-textarea" placeholder="Description">${data.description}</textarea>`,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const editedHeading = document.getElementById('editHeading').value;
                const editedDescription = document.getElementById('editDescription').value;

                await updatePost(postId, editedHeading, editedDescription);
                Swal.fire('Updated!', 'Your post has been updated.', 'success');

                const updatedData = {
                    ...data,
                    heading: editedHeading,
                    description: editedDescription,
                };
                const updatedPostDiv = createPostDiv(updatedData, postId);
                postDiv.replaceWith(updatedPostDiv);
            }
        });
    });

    return postDiv;
}

async function updatePost(postId, heading, description) {
    try {
        await updateDoc(doc(db, "posts", postId), {
            heading: heading,
            description: description,
        });
    } catch (error) {
        console.error("Error updating post:", error);
    }
}

async function deletePost(postId) {
    try {
        await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
        console.error("Error deleting post:", error);
    }
}
