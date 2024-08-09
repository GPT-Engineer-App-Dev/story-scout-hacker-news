import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Sun, Moon, ThumbsUp, User, Calendar, ExternalLink, MessageSquare, Star } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const fetchTopStories = async (sortBy = 'points') => {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const storyIds = await response.json();
    const topStories = await Promise.all(
      storyIds.slice(0, 100).map(async (id) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!storyResponse.ok) {
          throw new Error(`HTTP error! status: ${storyResponse.status}`);
        }
        return storyResponse.json();
      })
    );
    return topStories.sort((a, b) => sortBy === 'date' ? b.time - a.time : b.score - a.score);
  } catch (error) {
    console.error("Error fetching stories:", error);
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const { theme, setTheme } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['topStories', sortBy],
    queryFn: () => fetchTopStories(sortBy),
  });

  const filteredStories = data?.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const topTenStories = filteredStories.slice(0, 10).map(story => ({
    ...story,
    points: story.score || 0,
    title: story.title.length > 50 ? story.title.substring(0, 50) + '...' : story.title
  }));

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Stories</h2>
          <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Hacker News Top 100</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>

        <div className="flex space-x-4 mb-6">
          <Input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300} className="mb-8">
              <LineChart data={topTenStories}>
                <XAxis dataKey="title" tick={false} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.objectID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {story.score}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {story.by}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(story.time * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <a
                          href={story.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:text-blue-600"
                        >
                          Read More <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Comments
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Comments</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[400px] overflow-y-auto">
                              {/* Implement comment fetching and display here */}
                              <p>Comments for story ID: {story.objectID}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
