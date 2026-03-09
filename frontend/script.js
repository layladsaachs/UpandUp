// Tab 1 : Music Player Functions

// Obtain buttons from HTML file (document)
const tab1Button = document.getElementById("tab1Button");
const tab2Button = document.getElementById("tab2Button");
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");

// User clicks Music Player
// Show Music Player, hide Events
// Highlight Music Player
tab1Button.onclick = () => {
    tab1.classList.add("active");
    tab2.classList.remove("active");
    tab1Button.classList.add("active-tab");
    tab2Button.classList.remove("active-tab");
};

// User clicks Events
// Show Events, hide Music Player
// Highlight Events
tab2Button.onclick = () => {
    tab2.classList.add("active");
    tab1.classList.remove("active");
    tab2Button.classList.add("active-tab");
    tab1Button.classList.remove("active-tab");
};

// select all draggable boxes
// dragged = box to be moved, initialized to nothing
const cells = document.querySelectorAll(".cell");
let dragged = null;

// Loop through every box and attach drag behavior to each
cells.forEach(cell => {

    // Start dragging
    // Save box to be dragged 
    // Lower opacity for box currently undergoing drag
    cell.addEventListener("dragstart", () => {
        dragged = cell;
        cell.style.opacity = "0.5";
    });

    // End dragging
    // When done dragging box, restore original opacity 
    cell.addEventListener("dragend", () => {
        cell.style.opacity = "1";
    });

    // Drop cells into place
    cell.addEventListener("dragover",(event) => {
        event.preventDefault();
    });

    cell.addEventListener("drop", () => {
        // dragged cell does not drop onto itself
        if(dragged !== cell){
            const parent = cell.parentNode;
            const draggedIndex = [...parent.children].indexOf(dragged);
            const targetIndex = [...parent.children].indexOf(cell);

            // Reorder cells
            if(draggedIndex < targetIndex){
                parent.insertBefore(dragged, cell.nextSibling);
            }else{
                parent.insertBefore(dragged, cell);
            }
        }
    });

});


// Tab 2 : Event Functions
const arrows = document.querySelectorAll(".arrow");

arrows.forEach(button => {
    button.addEventListener("click", () => {
        
        const track = document.getElementById(button.dataset.track);
        const scrollAmount = 230;

        if(button.classList.contains("right")){   
            if(track.scrollLeft + track.clientWidth >= track.scrollWidth){
                track.scrollLeft = 0;
            }else{
                track.scrollLeft += scrollAmount;
            }
        }else{
            if(track.scrollLeft <= 0){
                track.scrollLeft = track.scrollWidth;
            }else{
                track.scrollLeft -= scrollAmount;
            }
        }
    });
});

       