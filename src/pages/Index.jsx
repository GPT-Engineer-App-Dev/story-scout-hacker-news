import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, ArrowUpCircle, Clock, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetchTopStories = async () => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=100');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chartData, setChartData] = useState([]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
  });

  useEffect(() => {
    if (data) {
      const pointsData = data.hits.slice(0, 10).map((story, index) => ({
        name: `Story ${index + 1}`,
        points: story.points,
      }));
      setChartData(pointsData);
    }
  }, [data]);

  const filteredStories = data?.hits.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) return <div className="text-center text-red-500">An error occurred: {error.message}</div>;

  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-300 animate-fade-in">Top 100 Hacker News Stories</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <div className="max-w-4xl mx-auto mb-8">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 shadow-lg"
        />
      </div>
      <div className="mb-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-300">Top 10 Stories by Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                  }} 
                />
                <Line type="monotone" dataKey="points" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <AnimatePresence>
        <motion.div layout className="grid gap-4 max-w-4xl mx-auto">
          {isLoading ? (
            Array(10).fill().map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            filteredStories.map((story, index) => (
              <motion.div
                key={story.objectID}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-300">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <ArrowUpCircle className="mr-1 h-4 w-4" />
                        <span>{story.points} points</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <User className="mr-1 h-4 w-4" />
                        <span>{story.author}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                      <a href={story.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        Read More <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
