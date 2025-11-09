document.addEventListener("DOMContentLoaded", function () {
    const authorId = "103320645"; // Dr. Anil N. Raghav's Semantic Scholar ID
    const apiUrl = `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,year,authors,externalIds,venue,publicationDate,isOpenAccess`;

    let publicationsData = []; // Store all publications for filtering

    async function fetchPublications() {
        const publicationsContainer = document.querySelector(".publications-container");
        publicationsContainer.innerHTML = `<p class="loading">Loading publications...</p>`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch publications");
            const data = await response.json();

            publicationsData = data.data; // Store globally for filtering
            sortPublications(); // Sort before rendering
            renderPublications(publicationsData);
            populateYearFilter();
        } catch (error) {
            console.error("Error fetching publications:", error);
            publicationsContainer.innerHTML = `<p class="error">Failed to load publications.</p>`;
        }
    }

    function sortPublications() {
        publicationsData.sort((a, b) => {
            let dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(`${a.year}-01-01`);
            let dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(`${b.year}-01-01`);
            return dateB - dateA; // Sort latest first
        });
    }

    function renderPublications(papers) {
        const publicationsContainer = document.querySelector(".publications-container");
        publicationsContainer.innerHTML = ""; // Clear previous content

        let publicationsByYear = {};
        papers.forEach((paper) => {
            let year = paper.year || "Unknown";
            if (!publicationsByYear[year]) publicationsByYear[year] = [];

            let authorsList = paper.authors.map(a => 
                `<span class="author-tag">
                    <a href="https://www.semanticscholar.org/author/${a.authorId}" target="_blank">${a.name}</a>
                </span>`
            ).join(" ");

            let paperLink = paper.externalIds.DOI ? `https://doi.org/${paper.externalIds.DOI}` : "#";

            let publicationDate = paper.publicationDate
                ? new Date(paper.publicationDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                  })
                : "Unknown Date";

            let publisher = paper.venue || "Fetching...";
            let venueHTML = publisher ? `<span class="venue">${publisher}</span>` : "";

            let isOpenAccess = paper.isOpenAccess 
                ? `<span class="open-access-tag">📄 Open Access</span>` 
                : "";

            let bibtexCitation = `
@article{${paper.title.replace(/\s+/g, "_")},
  author = {${paper.authors.map(a => a.name).join(" and ")}},
  title = {${paper.title}},
  journal = {${publisher || "Unknown"}},
  year = {${year}},
  doi = {${paper.externalIds.DOI || "N/A"}},
  url = {${paperLink}},
  note = {Accessed: ${new Date().toISOString().split("T")[0]}}
}`.trim();

            publicationsByYear[year].push(`
                <li class="publication-item">
                    <div class="publication-content">
                        <a href="${paperLink}" target="_blank" class="publication-title">${paper.title}</a>
                        <div class="publication-meta">
                            ${authorsList} · ${venueHTML} · ${publicationDate}
                        </div>
                        <div class="publication-actions">
                            ${isOpenAccess}
                            <button class="cite-button">📄 Cite</button>
                            <pre class="citation-text hidden">${bibtexCitation}</pre>
                        </div>
                    </div>
                </li>
            `);
        });

        // Display publications by year in descending order
        let sortedYears = Object.keys(publicationsByYear).sort((a, b) => b - a);
        sortedYears.forEach(year => {
            let yearSection = document.createElement("div");
            yearSection.classList.add("year-section");
            yearSection.innerHTML = `
                <h2>${year}</h2>
                <ul class="publication-list">${publicationsByYear[year].join("")}</ul>
            `;
            publicationsContainer.appendChild(yearSection);
        });
    }

    function filterPublications() {
        let searchQuery = document.getElementById("searchInput").value.toLowerCase();
        let selectedYear = document.getElementById("yearFilter").value;

        let filteredPapers = publicationsData.filter(paper => {
            let matchesSearch = paper.title.toLowerCase().includes(searchQuery) ||
                paper.authors.some(a => a.name.toLowerCase().includes(searchQuery));

            let matchesYear = selectedYear === "all" || paper.year.toString() === selectedYear;

            return matchesSearch && matchesYear;
        });

        renderPublications(filteredPapers);
    }

    function populateYearFilter() {
        let yearFilter = document.getElementById("yearFilter");

        // Extract unique years and sort them
        let uniqueYears = [...new Set(publicationsData.map(paper => paper.year).filter(y => y))].sort((a, b) => b - a);
        
        yearFilter.innerHTML = `<option value="all">All Years</option>`;
        uniqueYears.forEach(year => {
            let option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        console.log("Dropdown populated with years:", uniqueYears); // Debugging log
    }

    // Event Listeners for Search and Filter
    document.getElementById("searchInput").addEventListener("input", filterPublications);
    document.getElementById("yearFilter").addEventListener("change", filterPublications);

    // Fetch publications on page load
    fetchPublications();

    // Toggle citation visibility
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("cite-button")) {
            let citationText = event.target.nextElementSibling;
            citationText.classList.toggle("hidden");
        }
    });
});
