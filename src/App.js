import React, { useState } from 'react';
import axios from 'axios';

import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [articleContent, setArticleContent] = useState('');
    const [articleTitle, setArticleTitle] = useState(''); // To hold the current article's title
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [previousArticles, setPreviousArticles] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchAttempted(true);
        try {
            const response = await axios.get(`http://localhost:8000/search?q=${searchTerm}`);
            setResults(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const handleResultClick = async (pageId) => {
        fetchArticle(pageId);
    };

    const fetchArticle = async (pageId) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&format=json&origin=*`);
            setPreviousArticles(prev => [...prev, articleContent]); // Store the previous article content
            setArticleTitle(response.data.parse.title); // Set article title for better accessibility
            setArticleContent(response.data.parse.text['*']);
        } catch (error) {
            console.error('Error fetching article content:', error);
        }
    };

    const handleLinkClick = (event, title) => {
        event.preventDefault();
        loadArticleByTitle(title);
    };

    const loadArticleByTitle = async (title) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${title}&format=json&origin=*`);
            setPreviousArticles(prev => [...prev, articleContent]); // Store the previous article content
            setArticleTitle(response.data.parse.title); // Set article title
            setArticleContent(response.data.parse.text['*']);
        } catch (error) {
            console.error('Error loading article by title:', error);
        }
    };

    const handleBack = () => {
        if (previousArticles.length > 0) {
            const lastArticle = previousArticles.pop(); // Get the last article content
            setArticleContent(lastArticle); // Set the content to the last article
            setPreviousArticles(previousArticles); // Update previousArticles array
        }
    };

    const renderContent = (htmlContent) => {
        return parse(htmlContent, {
            replace: (domNode) => {
                if (domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
                    const title = domNode.attribs.href.split('/').pop();
                    return (
                        <button
                            style={{ background: 'none', color: 'blue', textDecoration: 'underline', border: 'none', cursor: 'pointer' }}
                            onClick={(event) => handleLinkClick(event, title)}
                        >
                            {domNode.children[0].data}
                        </button>
                    );
                }
                if (domNode.name === 'img' && domNode.attribs && domNode.attribs.src) {
                    return (
                        <img 
                            src={domNode.attribs.src} 
                            alt={articleTitle} // Use the title as alt text for accessibility
                            style={{ width: '100%', height: 'auto' }} 
                        />
                    );
                }
            }
        });
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
                />
                <button type="submit">Search</button>
            </form>

            <div className="results-container">
                {searchAttempted && results.length > 0 ? (
                    results.map((result) => (
                        <button key={result.pageid} onClick={() => handleResultClick(result.pageid)} className="result-item">
                            <h3>{result.title}</h3>
                            <p>{parse(result.snippet)} {/* Parse the snippet if it contains HTML */}</p>
                        </button>
                    ))
                ) : (
                    searchAttempted && <p>No results found.</p>
                )}
            </div>

            {articleContent && (
                <div className="article-container">
                    <h2 className="article-title">Article Details</h2>
                    <div className="article-content">
                        {renderContent(articleContent)} {/* Render parsed content here */}
                    </div>
                    <button onClick={handleBack}>Back</button>
                </div>
            )}
        </div>
    );
}

export default App;
