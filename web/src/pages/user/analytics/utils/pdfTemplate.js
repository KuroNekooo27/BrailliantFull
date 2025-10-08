export const generateAnalyticsReportHtml = (BOOKS_DATA, topBooksAvg, totalAccess, chartBase64) => {
    const mostAccessedBook = BOOKS_DATA[0];
    const leastAccessedBook = BOOKS_DATA[BOOKS_DATA.length - 1];
    const fastestBook = topBooksAvg[0];

    const formatTime = (secs) => {
        const h = String(Math.floor(secs / 3600)).padStart(2, "0");
        const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const interpretationText = (() => {
        let text = `The data indicates that <strong>${mostAccessedBook.book_title}</strong> is the most frequently accessed book, suggesting it is either the most popular or most relevant to readers. `;
        text += `In contrast, <strong>${leastAccessedBook.book_title}</strong> has the fewest accesses, which may point to lower interest or limited relevance. `;

        if (fastestBook.book_title === mostAccessedBook.book_title) {
            text += `Interestingly, this same book is also the fastest to read (${formatTime(fastestBook.avg_time)}), showing strong engagement.`;
        } else if (fastestBook.book_title === leastAccessedBook.book_title) {
            text += `Surprisingly, the least accessed book is also the fastest to read (${formatTime(fastestBook.avg_time)}), suggesting it may be overlooked despite being quick to complete.`;
        } else {
            text += `The fastest book to read is <strong>${fastestBook.book_title}</strong> (${formatTime(fastestBook.avg_time)}), suggesting shorter books may encourage quicker completion.`;
        }
        return text;
    })();

    return `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 100%;">
    <h1 style="text-align:center;">Analytics Report</h1>

    <!-- Book List Section -->
    <h3>All Books (Sorted from Most Accessed)</h3>
    <ul style="padding-left: 20px; line-height: 1.6;">
      ${BOOKS_DATA.map(
        (b) => `
        <li>
          <strong>${b.book_title}</strong> — ${b.book_count} sessions 
          (Avg Read: ${b.book_avg_read_time ? formatTime(b.book_avg_read_time) : "N/A"})
        </li>`
    ).join("")}
    </ul>

    <p><strong>Total Accesses:</strong> ${totalAccess}</p>

    <!-- Summary Section -->
    <h3>Summary Statistics</h3>
    <ul style="padding-left: 20px; line-height: 1.6;">
      <li><strong>Total Books:</strong> ${BOOKS_DATA.length}</li>
      <li><strong>Most Accessed:</strong> ${mostAccessedBook.book_title} (${mostAccessedBook.book_count})</li>
      <li><strong>Least Accessed:</strong> ${leastAccessedBook.book_title} (${leastAccessedBook.book_count})</li>
      <li><strong>Fastest Book Read:</strong> ${fastestBook.book_title} (${formatTime(fastestBook.avg_time)})</li>
    </ul>

    <!-- Interpretation -->
    <h3>Interpretation</h3>
    <p style="text-align: justify;">${interpretationText}</p>

    <!-- Chart -->
    ${chartBase64
            ? `
        <h3 style="margin-top: 30px;">Book Access Distribution</h3>
        <div style="text-align:center;">
          <img src="${chartBase64}" style="width:90%;max-width:350px;border:1px solid #ccc;border-radius:10px;" />
        </div>`
            : ""
        }

    <footer style="text-align:center; font-size:12px; margin-top:30px; color:#666;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </footer>

  </div>
  `;
};
