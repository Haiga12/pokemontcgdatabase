document.addEventListener("DOMContentLoaded", () => {
    const tcgdex = new TCGdex('en');
    const collectionDisplay = document.getElementById("collection-display");
    const setNames = {};
    
    async function fetchSets() {
        try {
            const sets = await tcgdex.fetchSets();
            sets.forEach(set => {
                setNames[set.id] = set.name;
            });
            populateSetFilter();
            loadCollection();
        } catch (error) {
            console.error("Error fetching sets:", error);
        }
    }

    function populateSetFilter() {
        const setFilter = document.getElementById('set-filter');
        Object.keys(setNames).forEach(setId => {
            const option = document.createElement('option');
            option.value = setId;
            option.textContent = setNames[setId];
            setFilter.appendChild(option);
        });
    }

    function loadCollection(filterSetId = '', searchTerm = '') {
        const emptyMessage = document.getElementById('empty-message');
        collectionDisplay.innerHTML = '';
    
        const savedCards = JSON.parse(localStorage.getItem("pokemonCollection")) || [];
        
        if (savedCards.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        } else {
            emptyMessage.style.display = 'none';
        }
    
        const filteredCards = savedCards.filter(card => {
            const matchesSet = !filterSetId || card.id.includes(filterSetId);
            const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSet && matchesSearch;
        });
    
        filteredCards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
        
            const cardName = document.createElement("h3");
            cardName.textContent = card.name;
        
            const cardImage = document.createElement("img");
            cardImage.src = card.image ? `${card.image}/low.webp` : "default_image_url.jpg";
            cardImage.alt = card.name;
        
            const setName = document.createElement("p");
            setName.textContent = "Set: " + (setNames[card.id.split('-')[0]] || "Unknown Set");
        
            const cardNumber = document.createElement('p');
            cardNumber.textContent = `Card Number: ${card.localId}`;
        
            // Create grade container
            const gradeContainer = document.createElement("div");
            gradeContainer.classList.add("grade-container");
        
            const gradeLabel = document.createElement("p");
            gradeLabel.textContent = "Grade: ";
        
            // Create grade dropdown
            const gradeDropdown = document.createElement("select");
            gradeDropdown.classList.add("grade-dropdown");
            gradeDropdown.innerHTML = `<option value="ungraded">Ungraded</option>`;
            
            for (let grade = 1; grade <= 10; grade += 0.5) {
                gradeDropdown.innerHTML += `<option value="${grade}">${grade}</option>`;
            }
        
            const savedGrade = card.grade || "ungraded";
            gradeDropdown.value = savedGrade;

            gradeDropdown.addEventListener("click", (event) => {
                event.stopPropagation();
            });
            gradeDropdown.addEventListener("change", (event) => {
                card.grade = event.target.value;
                saveCardGrade(card);
            });
        
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove from Collection";
            removeButton.addEventListener("click", () => {
                event.stopPropagation();
                removeFromCollection(card.id)
            });
        
            cardElement.appendChild(cardName);
            cardElement.appendChild(cardImage);
            cardElement.appendChild(setName);
            cardElement.appendChild(cardNumber);
            cardElement.appendChild(gradeContainer); // Append the grade container
            gradeContainer.appendChild(gradeLabel);
            gradeContainer.appendChild(gradeDropdown);
            cardElement.appendChild(removeButton);
            collectionDisplay.appendChild(cardElement);

            cardElement.addEventListener("click", () => openCardModal(card));
                document.getElementById("close-modal").addEventListener("click", () => {
                    document.getElementById("card-modal").classList.add("hidden");
                    document.getElementById("modal-image").classList.remove("zoomed");
                });
        });
    }

    function openCardModal(card) {
        const modal = document.getElementById("card-modal");
        const title = document.getElementById("modal-title");
        const image = document.getElementById("modal-image");
        const set = document.getElementById("modal-set");
        const number = document.getElementById("modal-cardnumber");
        const removeButton = document.getElementById("modal-remove-button");

        title.textContent = card.name;
        image.src = card.image ? `${card.image}/high.webp` : "default_image_url.jpg";
        image.alt = card.name;

        set.textContent = "Set: " + (setNames[card.id.split('-')[0]] || "Unknown Set");
        number.textContent = "Card Number: " + (card.localId || "N/A");

        removeButton.onclick = () => {
            removeFromCollection(card.id);
            modal.classList.remove("hidden");
        };
        
        document.getElementById("modal-image").addEventListener("click", () => {
                const image = document.getElementById("modal-image");
                image.classList.toggle("zoomed");
        });

        modal.classList.remove("hidden");
    }

    function saveCardGrade(card) {
        let collection = JSON.parse(localStorage.getItem("pokemonCollection")) || [];
        const cardIndex = collection.findIndex(savedCard => savedCard.id === card.id);
    
        if (cardIndex !== -1) {
            collection[cardIndex].grade = card.grade;
            localStorage.setItem("pokemonCollection", JSON.stringify(collection));
        }
    }

    function removeFromCollection(cardId) {
        let collection = JSON.parse(localStorage.getItem("pokemonCollection")) || [];
        collection = collection.filter(card => card.id !== cardId);
        localStorage.setItem("pokemonCollection", JSON.stringify(collection));
        loadCollection();
        alert("Card removed from your collection.");
    }

    document.getElementById('set-filter').addEventListener('change', (event) => {
        const selectedSet = event.target.value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        loadCollection(selectedSet, searchTerm);
    });

    document.getElementById('search-input').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const selectedSet = document.getElementById('set-filter').value;
        loadCollection(selectedSet, searchTerm);
    });
    
    // Export Collection as JSON
    function exportCollectionToJSON() {
        const collection = JSON.parse(localStorage.getItem("pokemonCollection")) || [];
        if (collection.length === 0) {
            alert("Your collection is empty, nothing to export.");
            return;
        }

        const jsonBlob = new Blob([JSON.stringify(collection, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(jsonBlob);
        link.download = "pokemonTCG_collection.json";
        link.click();
    }

    // Add this to your page to trigger the export action
    const exportButton = document.createElement('button');
    exportButton.textContent = "Export Collection as JSON";
    exportButton.addEventListener('click', exportCollectionToJSON);
    document.body.appendChild(exportButton);  // Place it where you want on the page

    // Import Collection from JSON
    function importCollectionFromJSON(event) {
        const file = event.target.files[0];
        if (!file) {
            alert("No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedCollection = JSON.parse(e.target.result);
                if (Array.isArray(importedCollection)) {
                    localStorage.setItem("pokemonCollection", JSON.stringify(importedCollection));
                    alert("Collection imported successfully!");
                    loadCollection();  // Refresh the collection display
                } else {
                    alert("Invalid JSON structure.");
                }
            } catch (error) {
                alert("Error parsing JSON file.");
            }
        };
        reader.readAsText(file);
    }

    // Add this to create a file input button for importing collection
    const importButton = document.createElement('button');
    importButton.textContent = "Import Collection from JSON";
    importButton.addEventListener('click', () => document.getElementById("file-input").click());
    document.body.appendChild(importButton);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'file-input';
    fileInput.style.display = 'none';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', importCollectionFromJSON);
    document.body.appendChild(fileInput);  // Add it to the DOM (but hidden)

    fetchSets();
});
