// i am not sure if this is the right way to do it
// idea is to manage load, we will be fetching data from server in batches and cache it in the context
// batch size will mostly be 10
// now use case could be the feed of the forum, where we will be fetching 10 posts at a time
// and then when user scrolls down, we will fetch next 10 posts
// so we will be managing the load in the context
// so when user changes the feed page and comes back to it, he/she shouldn't have to wait for fetching posts again, same with community recommendations, comments, etc.
// we can't do this everywhere off course but will try to do it in main features at least

import { useState } from "react"
import { DataContext } from "./dataContextInstance";

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({});
    const [pages, setPages] = useState({});
    const [loading, setLoading] = useState({});
    const [hasMore, setHasMore] = useState({});
    const cache = new Map();

    const BATCH_SIZE = 10;

    const fetchData = async (type, newPage, endpoint) => {
        // return if data is being loaded or finished
        if(loading[type] || !hasMore[type]) return;

        if (cache.has(`${type}-${newPage}`)) {
            setData(prev => ({
                ...prev,
                [type]: [...(prev[type] || []), ...cache.get(`${type}-${newPage}`)],
            }))
            return;
        }

        setLoading(prev => ({...prev, [type]: true }));

        try{
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}?page=${newPage}&limit=${BATCH_SIZE}`)
            const result = await response.json();

            // this is little sus line we will declare that there is no more data if the last fetch had less number of items than batch size
            // this makes sense but we assume that data won't be updated
            // and that is obviously not true
            // so as a fallback mechanism we might have to add a force refresh button
            if (result.length < BATCH_SIZE) {
                setHasMore(prev => ({ ...prev, [type]: false}));
            }

            cache.set(`${type}-${newPage}`, result);

            setData((prev) => ({
                ...prev,
                [type]: [...(prev[type] || []), ...result],
            }))

            setPages(prev => ({
                ...prev,
                [type]: newPage
            }));
        }catch(error) {
            console.error(`Error fetching ${type}:`, error);
        }

        setLoading(prev => ({ ...prev, [type]: false}));
    }
    
    return (
        <DataContext.Provider value={{ data, fetchData, pages, hasMore, loading }}>
            {children}
        </DataContext.Provider>
    )
}