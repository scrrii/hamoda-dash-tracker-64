import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/Calendar';
import { PrayerTracker } from '@/components/PrayerTracker';
import { ExerciseTracker } from '@/components/ExerciseTracker';
import { NutritionTracker } from '@/components/NutritionTracker';
import { CalorieCalculator } from '@/components/CalorieCalculator';
import { GermanWords } from '@/components/GermanWords';
import { StudyTracker } from '@/components/StudyTracker';
import { TaskManager } from '@/components/TaskManager';
import { ProgressSummary } from '@/components/ProgressSummary';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Set date range: from today to end of October 2025
  const minDate = new Date();
  const maxDate = new Date('2025-10-31');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pattern-islamic">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              لوحة تتبع التطوير الشخصي
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            رحلة التطوير الشاملة لحمودة حتى نهاية أكتوبر 2025
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
            <span className="text-sm font-medium">
              الهدف: أفضل نسخة من نفسك في 
            </span>
            <span className="font-bold text-primary">
              {Math.ceil((maxDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24))} يوم
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6 bg-card">
                <TabsTrigger value="today" className="text-sm">اليوم</TabsTrigger>
                <TabsTrigger value="prayer" className="text-sm">الصلوات</TabsTrigger>
                <TabsTrigger value="exercise" className="text-sm">التمارين</TabsTrigger>
                <TabsTrigger value="nutrition" className="text-sm">التغذية</TabsTrigger>
                <TabsTrigger value="study" className="text-sm">الدراسة</TabsTrigger>
                <TabsTrigger value="progress" className="text-sm">التقارير</TabsTrigger>
              </TabsList>

              {/* Today's Overview */}
              <TabsContent value="today" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <PrayerTracker selectedDate={selectedDate} />
                  <TaskManager selectedDate={selectedDate} />
                  <ExerciseTracker selectedDate={selectedDate} />
                  <NutritionTracker selectedDate={selectedDate} />
                  <GermanWords selectedDate={selectedDate} />
                  <StudyTracker selectedDate={selectedDate} />
                </div>
              </TabsContent>

              {/* Prayer Tab */}
              <TabsContent value="prayer">
                <PrayerTracker selectedDate={selectedDate} />
              </TabsContent>

              {/* Exercise Tab */}
              <TabsContent value="exercise" className="space-y-6">
                <ExerciseTracker selectedDate={selectedDate} />
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="space-y-6">
                <NutritionTracker selectedDate={selectedDate} />
                <CalorieCalculator />
              </TabsContent>

              {/* Study Tab */}
              <TabsContent value="study" className="space-y-6">
                <StudyTracker selectedDate={selectedDate} />
                <GermanWords selectedDate={selectedDate} />
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress">
                <ProgressSummary selectedDate={selectedDate} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-primary mb-2">
              "إن الله لا يغير ما بقوم حتى يغيروا ما بأنفسهم"
            </h3>
            <p className="text-sm text-muted-foreground">
              كل يوم خطوة نحو النسخة الأفضل من نفسك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
