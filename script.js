document.addEventListener("DOMContentLoaded", () => {
    const tcgdex = new TCGdex('en');

    let allCards = [];
    let setNames = {};

    async function populateSetFilter() {
        try {
            const sets = await tcgdex.fetchSets();
            const setFilter = document.getElementById('set-filter');

            sets.forEach(set => {
                const option = document.createElement('option');
                option.value = set.id;       
                option.textContent = set.name;
                setFilter.appendChild(option);

                setNames[set.id] = set.name;
            });
        } catch (error) {
            console.error("Error fetching sets:", error);
        }
    }

    async function displayCards(setId, searchTerm = '') {
        try {
            if (allCards.length === 0) {
                allCards = await tcgdex.fetch('cards');
            }
    
            const cardDisplay = document.getElementById('card-display');
            cardDisplay.innerHTML = '';
    
            if (setId === "" && searchTerm === "") {
                return;
            }
    
            const filteredCards = allCards.filter(card => {
                const matchesSet = setId === "" || card.id.includes(setId);
                const matchesSearchTerm = card.name.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSet && matchesSearchTerm;
            });

            if (filteredCards.length === 0) {
            cardDisplay.innerHTML = '<p>No matching cards found.</p>';
            }
    
            filteredCards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                
                const cardName = document.createElement('h3');
                cardName.textContent = card.name;
    
                const cardImage = document.createElement('img');
                if (card.image) {
                    cardImage.src = `${card.image}/low.webp`;
                    cardImage.alt = card.name;
                } 
                else {
                    cardImage.src = "default_image_url.jpg";
                    cardImage.alt = "No Image Available";
                }
    
                const setName = document.createElement('p');
                setName.textContent = "Set: " + setNames[card.id.split('-')[0]] || "Unknown Set";
    
                const cardNumber = document.createElement('p');
                cardNumber.textContent = `Card Number: ${card.localId}`;

                const saveButton = document.createElement("button");
                saveButton.textContent = "Save to Collection";
                saveButton.addEventListener("click", () => {
                    event.stopPropagation();
                    saveToCollection(card)
                });
    
                cardElement.appendChild(cardName);
                cardElement.appendChild(cardImage);
                cardElement.appendChild(setName);
                cardElement.appendChild(cardNumber);
                cardElement.appendChild(saveButton);
                cardDisplay.appendChild(cardElement);

                cardElement.addEventListener("click", () => openCardModal(card));
                document.getElementById("close-modal").addEventListener("click", () => {
                    document.getElementById("card-modal").classList.add("hidden");
                    document.getElementById("modal-image").classList.remove("zoomed");
                });
            });
        } catch (error) {
            console.error("Error fetching cards:", error);
        }
    }

    function openCardModal(card) {
        const modal = document.getElementById("card-modal");
        const title = document.getElementById("modal-title");
        const image = document.getElementById("modal-image");
        const set = document.getElementById("modal-set");
        const number = document.getElementById("modal-cardnumber");
        const saveButton = document.getElementById("modal-save-button");

        title.textContent = card.name;
        image.src = card.image ? `${card.image}/high.webp` : "default_image_url.jpg";
        image.alt = card.name;

        set.textContent = "Set: " + (setNames[card.id.split('-')[0]] || "Unknown Set");
        number.textContent = "Card Number: " + (card.localId || "N/A");

        saveButton.onclick = () => {
            saveToCollection(card);
        };
        document.getElementById("modal-image").addEventListener("click", () => {
                const image = document.getElementById("modal-image");
                image.classList.toggle("zoomed");
        });

        modal.classList.remove("hidden");
    }

       
    function saveToCollection(card) {
        const currentCollection = JSON.parse(localStorage.getItem("pokemonCollection")) || [];

        const isDuplicate = currentCollection.some(savedCard => savedCard.id === card.id);

        if (!isDuplicate) {
            currentCollection.push(card);
            localStorage.setItem("pokemonCollection", JSON.stringify(currentCollection));
            alert(`${card.name} has been saved to your collection!`);
        } else {
            alert(`${card.name} is already in your collection.`);
        }
    }

    function toggleEmptyMessage() {
        const setFilter = document.getElementById('set-filter').value;
        const searchInput = document.getElementById('search-input').value;
        const emptyMessage = document.getElementById('empty-message');
        
        if (setFilter === "" && searchInput.trim() === "") {
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.style.display = "none";
        }
    }

    document.getElementById('set-filter').addEventListener('change', (event) => {
        const selectedSet = event.target.value;
        const searchTerm = document.getElementById('search-input').value;
        const cardDisplay = document.getElementById('card-display');
        toggleEmptyMessage();
        if (selectedSet === "" && searchTerm === "") {
            cardDisplay.innerHTML = '';
        } else {
            displayCards(selectedSet, searchTerm);
        }
    });

    document.getElementById('search-input').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const selectedSet = document.getElementById('set-filter').value;
        displayCards(selectedSet, searchTerm);
        toggleEmptyMessage();
    });

    populateSetFilter();
});