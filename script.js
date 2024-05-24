document.addEventListener("DOMContentLoaded", () => {
    let colleges = [];
    let currentPage = 1;
    const rowsPerPage = 10;
    const tableBody = document.getElementById("collegeTableBody");
    const searchInput = document.getElementById("searchInput");
    const ratingsModal = document.getElementById("ratingsModal");
    const ratingsList = document.getElementById("ratingsList");

    // Load initial data
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Process data to ensure ratings are above 6 when undefined
            colleges = processCollegesData(data);
            displayRows(colleges.slice(0, rowsPerPage));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Function to ensure ratings are above 6 when undefined
    function processCollegesData(data) {
        return data.map(college => {
            if (college.userRating === undefined || college.userRating < 6) {
                college.userRating = 6 + Math.random() * 4; // Assign a random rating above 6
            }
            // Generate random user reviews count between 500 to 1000
            college.userReviews = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
            
            // Generate random placement data
            college.highestPackage = generateRandomPackage(20, 30); // Generate a package between 20 to 30 Lakhs
            college.averagePackage = generateRandomPackage(10, 20); // Generate a package between 10 to 20 Lakhs
            
            return college;
        });
    }

    // Function to generate a random package between min and max
    function generateRandomPackage(min, max) {
        return (Math.floor(Math.random() * (max - min + 1)) + min) * 100000; // Random package in Lakhs
    }

    // Infinite Scroll
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            currentPage++;
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = currentPage * rowsPerPage;
            displayRows(colleges.slice(startIndex, endIndex));
        }
    });

    // Display rows
    function displayRows(rows) {
        rows.forEach(college => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${college.cdRank}</td>
                <td>
                    <div class="college-info">
                        <img src="${college.logo}" alt="${college.name} Logo" class="college-logo">
                        <div class="college-details">
                            <span class="college-name">${college.name}</span> <br>
                            <span class="course">Course offered: ${college.course}</span> <br>
                            <span class="location">Location: ${college.location}</span>
                        </div>
                    </div>
                    <div class="button-group">
                        <button onclick="applyNow('${college.name}')">Apply Now</button>
                        <button onclick="downloadBrochure('${college.name}')">Download Brochure</button>
                        <button onclick="addToCompare('${college.name}')">Add to Compare</button>
                    </div>
                </td>
                <td class="fees-details">
                    ${college.course} <br>
                    1 year fees: ${college.fees} Lakh <br>
                    <button class="compare-button" onclick="compareFees(${college.fees}, '${college.name}')">Compare Fees</button>
                </td>
                <td class="placement-details">
                    <div>
                        <span class="package-heading">Highest Package:</span> <br>
                        <span class="package-amount">${college.highestPackage.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="package-heading">Average Package:</span> <br>
                        <span class="package-amount">${college.averagePackage.toLocaleString()}</span>
                    </div>
                    <button class="compare-placement-button" onclick="comparePlacement('${college.name}')">Compare Placement</button>
                </td>
                <td>
                    ${college.userRating.toFixed(1)}/10 <br>
                    Based on ${college.userReviews} user reviews
                </td>
                <td>
                    ${college.ranking}
                    <br>
                    <button class="ratings-button" onclick="showRatings('${college.name}', ${JSON.stringify(college.ratings)})">Ratings</button>
                    <ul class="ratings-list" id="${college.name.replace(/\s/g, '-').toLowerCase()}-ratings">
                        ${getRatingsHtml(college.ratings)}
                    </ul>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to get ratings HTML
    function getRatingsHtml(ratings) {
        return Object.entries(ratings).map(([organization, rating]) => {
            return `<li>${organization}: ${rating}/5</li>`;
        }).join('');
    }

    // Function to show ratings
    window.showRatings = function showRatings(collegeName, ratings) {
        const ratingsModalId = collegeName.replace(/\s/g, '-').toLowerCase() + "-ratings";
        const ratingsList = document.getElementById(ratingsModalId);
        ratingsList.style.display = "block";
        ratingsModal.style.display = "block";
    };

    // Close the ratings modal when clicking on the close button
    ratingsModal.querySelector(".close").addEventListener("click", () => {
        ratingsModal.style.display = "none";
        const ratingsLists = document.querySelectorAll('.ratings-list');
        ratingsLists.forEach(list => {
            list.style.display = "none";
        });
    });

    // Sort table
    window.sortTable = function sortTable(column) {
        const direction = this.sortDirection = !this.sortDirection;
        colleges.sort((a, b) => {
            if (column === 'ranking') {
                const rankA = parseInt(a[column].split('/')[0]);
                const rankB = parseInt(b[column].split('/')[0]);
                return direction ? rankA - rankB : rankB - rankA;
            } else {
                return direction ? a[column] - b[column] : b[column] - a[column];
            }
        });
        tableBody.innerHTML = '';
        currentPage = 1;
        displayRows(colleges.slice(0, currentPage * rowsPerPage));
    };

    // Search functionality
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredColleges = colleges.filter(college => college.name.toLowerCase().includes(query));
        tableBody.innerHTML = '';
        currentPage = 1;
        displayRows(filteredColleges.slice(0, currentPage * rowsPerPage));
    });

    // Button actions
    window.applyNow = function applyNow(collegeName) {
        alert(`Applying to ${collegeName}`);
    };

    window.downloadBrochure = function downloadBrochure(collegeName) {
        alert(`Downloading brochure for ${collegeName}`);
    };

    window.addToCompare = function addToCompare(collegeName) {
        alert(`Adding ${collegeName} to compare list`);
    };

    // Compare fees
    window.compareFees = function compareFees(fees, collegeName) {
        const averageFees = colleges.reduce((sum, college) => sum + college.fees, 0) / colleges.length;
        const comparison = fees > averageFees ? "higher" : "lower";
        alert(`The fees for ${collegeName} (${fees} Lakh) are ${comparison} than the average fees (${averageFees.toFixed(2)} Lakh).`);
    };

    // Compare placement
    window.comparePlacement = function comparePlacement(collegeName) {
        // Logic to compare placement details across colleges
        alert(`Compare placement for ${collegeName}`);
    };
});

