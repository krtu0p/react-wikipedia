import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [articleContent, setArticleContent] = useState('');
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchAttempted(true);
        setError(''); // Reset error message on new search
        try {
            // Use the API URL from the environment variable
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/search?q=${searchTerm}`);
            console.log('API Response:', response.data); // Log the full response for debugging
            // Check if results exist before accessing them
            if (response.data && response.data.results) {
                setResults(response.data.results); // Ensure response.data.results matches your API response structure
            } else {
                setResults([]); // Clear results if no results are found
                setError('No results found.');
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setError('Failed to fetch search results. Please try again.');
        }
    };

    const handleResultClick = async (pageId) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&format=json&origin=*`);
            setArticleContent(response.data.parse.text['*']);
        } catch (error) {
            console.error('Error fetching article content:', error);
            setError('Failed to fetch article content. Please try again.');
        }
    };

    return (
        <div className="App">
            <h1>Wikipedia Search Engine</h1>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Wikipedia"
                    required
                />
                <button type="submit">Search</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="results-container">
                {searchAttempted && results.length > 0 ? (
                    results.map((result) => (
                        <div key={result.pageid} onClick={() => handleResultClick(result.pageid)} className="result-item">
                            <h3>{result.title}</h3>
                            <p dangerouslySetInnerHTML={{ __html: result.snippet }} />
                        </div>
                    ))
                ) : (
                    searchAttempted && <p>No results found.</p>
                )}
            </div>

            {articleContent && (
                <div className="article-container">
                    <h2 className="article-title">Article Details</h2>
                    <div className="article-content" dangerouslySetInnerHTML={{ __html: articleContent }} />
                </div>
            )}
        </div>
    );
}

export default App;
