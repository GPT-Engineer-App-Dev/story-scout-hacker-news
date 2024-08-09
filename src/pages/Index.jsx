import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, ArrowUpCircle, Clock, User } from 'lucide-react';
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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-blue-100 to-purple-100">
      <h1 className="text-5xl font-bold mb-8 text-center text-blue-800 animate-fade-in">Top 100 Hacker News Stories</h1>
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
            <CardTitle>Top 10 Stories by Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
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
                <Card className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-blue-800">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center text-green-600">
                        <ArrowUpCircle className="mr-1 h-4 w-4" />
                        <span>{story.points} points</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="mr-1 h-4 w-4" />
                        <span>{story.author}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full">
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
