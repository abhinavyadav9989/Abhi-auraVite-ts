import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { DealerPreferences } from '@/api/entities';

// MP-001: Fuzzy Search with auto-suggestions and search history
export default function FuzzySearchBar({ onSearch, currentDealer, placeholder = "Search vehicles..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, [currentDealer]);

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
        Vehicle.filter({ status: 'live' }, '-created_date', 20),
        Dealer.list('-created_date', 10)
      ]);

      const vehicleSuggestions = vehicles
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
      const makeModelSuggestions = [...new Set(vehicles.map(v => v.make))]
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

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    saveSearchHistory(searchTerm);
    onSearch(searchTerm);
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
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                }
              }}
              placeholder={placeholder}
              className="pl-10 pr-4"
            />
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandList>
              {/* Search History */}
              {searchHistory.length > 0 && query.length === 0 && (
                <CommandGroup heading="Recent Searches">
                  {searchHistory.slice(0, 5).map((term, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionClick({ text: term })}
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{term}</span>
                    </CommandItem>
                  ))}
                  <CommandItem onSelect={clearSearchHistory} className="text-slate-500">
                    <X className="w-4 h-4 mr-2" />
                    Clear history
                  </CommandItem>
                </CommandGroup>
              )}

              {/* Live Suggestions */}
              {suggestions.length > 0 && query.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionClick(suggestion)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium">{suggestion.text}</div>
                          <div className="text-xs text-slate-500">{suggestion.subtext}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty State */}
              {query.length > 0 && suggestions.length === 0 && !isLoading && (
                <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
              )}

              {isLoading && (
                <CommandEmpty>Searching...</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}