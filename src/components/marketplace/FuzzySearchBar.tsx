import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { DealerPreferences } from '@/api/entities';

// MP-001: Fuzzy Search with auto-suggestions and search history
export default function FuzzySearchBar({ onSearch, currentDealer, placeholder = "Search vehicles...", value = "" }) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, [currentDealer]);

  // Sync query with value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const loadSearchHistory = async () => {
    if (!currentDealer) return;
    try {
      const preferences = await DealerPreferences.filter({ dealer_id: currentDealer.id });
      if (preferences.length > 0 && preferences[0].search_history) {
        setSearchHistory(preferences[0].search_history || []);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (searchTerm) => {
    if (!currentDealer || !searchTerm.trim()) return;
    
    try {
      const preferences = await DealerPreferences.filter({ dealer_id: currentDealer.id });
      let updatedHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
      
      if (preferences.length > 0) {
        await DealerPreferences.update(preferences[0].id, { search_history: updatedHistory });
      } else {
        await DealerPreferences.create({ 
          dealer_id: currentDealer.id, 
          search_history: updatedHistory 
        });
      }
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Debounced suggestions fetch
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch vehicles and dealers for suggestions
      const [vehicles, dealers] = await Promise.all([
        Vehicle.filter({ status: 'live' }),
        Dealer.list()
      ]);

      // Filter out current dealer's vehicles from suggestions
      let filteredVehicles = vehicles;
      if (currentDealer) {
        filteredVehicles = vehicles.filter(v => v.dealer_id !== currentDealer.id);
      }

      const vehicleSuggestions = filteredVehicles
        .filter(v => 
          v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
        .map(v => ({
          type: 'vehicle',
          text: `${v.make} ${v.model} ${v.year}`,
          subtext: v.registration_number,
          data: v
        }));

      const dealerSuggestions = dealers
        .filter(d => 
          d.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.city?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 3)
        .map(d => ({
          type: 'dealer',
          text: d.business_name,
          subtext: d.city,
          data: d
        }));

      // Generate make/model suggestions
      const makeModelSuggestions = [...new Set(filteredVehicles.map(v => v.make))]
        .filter(make => make?.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 3)
        .map(make => ({
          type: 'make',
          text: make,
          subtext: 'Make',
          data: { make }
        }));

      setSuggestions([...vehicleSuggestions, ...dealerSuggestions, ...makeModelSuggestions]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  }, []);

  // Debounce suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.fuzzy-search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSearch = (searchTerm) => {
    // Allow empty search to clear filters
    saveSearchHistory(searchTerm);
    onSearch(searchTerm);
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch(''); // Clear the search
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const clearSearchHistory = async () => {
    if (!currentDealer) return;
    
    try {
      const preferences = await DealerPreferences.filter({ dealer_id: currentDealer.id });
      if (preferences.length > 0) {
        await DealerPreferences.update(preferences[0].id, { search_history: [] });
      }
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  return (
    <div className="relative w-full fuzzy-search-container">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            } else if (e.key === 'Escape') {
              handleClearSearch();
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && query.length === 0 && (
            <div className="p-2">
              <h3 className="text-sm font-semibold mb-2">Recent Searches</h3>
              <div className="flex flex-col gap-1">
                {searchHistory.slice(0, 5).map((term, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestionClick({ text: term })}
                    className="justify-start text-sm"
                  >
                    <Clock className="w-4 h-4 text-slate-400 mr-2" />
                    <span>{term}</span>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearchHistory}
                  className="justify-start text-sm text-red-500"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear history
                </Button>
              </div>
            </div>
          )}

          {/* Live Suggestions */}
          {suggestions.length > 0 && query.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-semibold mb-2">Suggestions</h3>
              <div className="flex flex-col gap-1">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="justify-start text-sm"
                  >
                    <TrendingUp className="w-4 h-4 text-slate-400 mr-2" />
                    <div>
                      <div className="font-medium">{suggestion.text}</div>
                      <div className="text-xs text-slate-500">{suggestion.subtext}</div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {suggestion.type}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

                     {/* Clear Search Option */}
           {query.length > 0 && (
             <div className="p-2 border-t border-slate-100">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleClearSearch}
                 className="w-full justify-start text-sm text-red-500 hover:text-red-700"
               >
                 <X className="w-4 h-4 mr-2" />
                 Clear search &quot;{query}&quot;
               </Button>
             </div>
           )}

           {/* Empty State */}
           {query.length > 0 && suggestions.length === 0 && !isLoading && (
             <div className="p-2 text-center text-sm text-slate-500">
               No results found for &quot;{query}&quot;
             </div>
           )}

           {isLoading && (
             <div className="p-2 text-center text-sm text-slate-500">
               Searching...
             </div>
           )}
        </div>
      )}
    </div>
  );
}