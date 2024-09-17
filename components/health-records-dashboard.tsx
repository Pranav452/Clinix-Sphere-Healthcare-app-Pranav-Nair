'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface HealthRecord {
  id: string
  date: string
  category: string
  temperature: number
  bloodPressure: string
  heartRate: number
}

interface User {
  id: string
  name: string
  email: string
}

const categories = ['General', 'Exercise', 'Illness', 'Medication', 'Other'] as const

const formSchema = z.object({
  date: z.string().nonempty('Date is required'),
  category: z.enum(categories, {
    required_error: "Please select a category.",
  }),
  temperature: z.number().min(35).max(42, 'Temperature must be between 35°C and 42°C'),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in the format 120/80'),
  heartRate: z.number().int().min(40).max(220, 'Heart rate must be between 40 and 220 bpm'),
})

export function HealthRecordsDashboardComponent() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    const storedRecords = localStorage.getItem('healthRecords')
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords))
    }
    // Simulating user authentication
    setCurrentUser({ id: '1', name: '', email: '' })
  }, [])

  useEffect(() => {
    localStorage.setItem('healthRecords', JSON.stringify(records))
  }, [records])

  const addRecord = (record: Omit<HealthRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() }
    setRecords([...records, newRecord])
  }

  const updateRecord = (updatedRecord: HealthRecord) => {
    setRecords(records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ))
  }

  const deleteRecord = (id: string) => {
    setRecords(records.filter(record => record.id !== id))
  }

  const filteredRecords = records.filter(record => 
    (selectedCategories.length === 0 || selectedCategories.includes(record.category)) &&
    (record.date.includes(searchTerm) ||
    record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.temperature.toString().includes(searchTerm) ||
    record.bloodPressure.includes(searchTerm) ||
    record.heartRate.toString().includes(searchTerm))
  )

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 text-white min-h-screen">
      <header className="flex justify-between items-center mb-8 bg-black p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-white">Health Records Dashboard</h1>
        {currentUser && (
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=pranav+nair`} />
              <AvatarFallback style={{ color: 'white' }}>PN</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-black">{currentUser.name}</p>
              <p className="text-sm text-gray-700">{currentUser.email}</p>
            </div>
          </div>
        )}
      </header>
      
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="records" className="text-black">Records</TabsTrigger>
          <TabsTrigger value="charts" className="text-black">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="w-full sm:w-1/2">
                <Input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default">Add New Record</Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-black">Add New Health Record</DialogTitle>
                  </DialogHeader>
                  <HealthRecordForm onSubmit={addRecord} />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2 text-black">Filter by Category</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Health Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black">Date</TableHead>
                      <TableHead className="text-black">Category</TableHead>
                      <TableHead className="text-black">Temperature (°C)</TableHead>
                      <TableHead className="text-black">Blood Pressure</TableHead>
                      <TableHead className="text-black">Heart Rate (bpm)</TableHead>
                      <TableHead className="text-black">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="text-black">{record.date}</TableCell>
                        <TableCell className="text-black">{record.category}</TableCell>
                        <TableCell className="text-black">{record.temperature}</TableCell>
                        <TableCell className="text-black">{record.bloodPressure}</TableCell>
                        <TableCell className="text-black">{record.heartRate}</TableCell>
                        <TableCell>
                          <Button variant="outline" className="mr-2" onClick={() => setSelectedRecord(record)}>
                            View
                          </Button>
                          <Button variant="destructive" onClick={() => deleteRecord(record.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Health Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={records}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip contentStyle={{ color: 'black' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">Health Record Details</DialogTitle>
            </DialogHeader>
            <HealthRecordForm 
              initialData={selectedRecord} 
              onSubmit={(updatedRecord) => {
                updateRecord({ ...updatedRecord, id: selectedRecord.id })
                setSelectedRecord(null)
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface HealthRecordFormProps {
  initialData?: HealthRecord
  onSubmit: (record: Omit<HealthRecord, 'id'>) => void
}

function HealthRecordForm({ initialData, onSubmit }: HealthRecordFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      category: initialData.category as typeof categories[number]
    } : {
      date: '',
      category: 'General',
      temperature: 36.5,
      bloodPressure: '',
      heartRate: 70,
    },
  })

  function onSubmitForm(values: z.infer<typeof formSchema>) {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="text-black" />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-black">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Temperature (°C)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="text-black" />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bloodPressure"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Blood Pressure</FormLabel>
              <FormControl>
                <Input placeholder="120/80" {...field} className="text-black" />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="heartRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Heart Rate (bpm)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="text-black" />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{initialData ? 'Update' : 'Add'} Record</Button>
      </form>
    </Form>
  )
}