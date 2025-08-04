import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Prayer {
  name: string;
  adhanTime: string;
  prayedTime?: string;
  isPrayed: boolean;
  delay: number; // in minutes
}

interface PrayerTrackerProps {
  selectedDate: Date;
}

export const PrayerTracker = ({ selectedDate }: PrayerTrackerProps) => {
  const [prayers, setPrayers] = useState<Prayer[]>([
    { name: 'الفجر', adhanTime: '05:30', isPrayed: false, delay: 0 },
    { name: 'الظهر', adhanTime: '12:15', isPrayed: false, delay: 0 },
    { name: 'العصر', adhanTime: '15:45', isPrayed: false, delay: 0 },
    { name: 'المغرب', adhanTime: '18:20', isPrayed: false, delay: 0 },
    { name: 'العشاء', adhanTime: '19:45', isPrayed: false, delay: 0 },
  ]);

  useEffect(() => {
    loadPrayerData();
  }, [selectedDate]);

  const loadPrayerData = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const saved = localStorage.getItem(`prayers-${dateKey}`);
    if (saved) {
      setPrayers(JSON.parse(saved));
    } else {
      // Reset to default for new day
      setPrayers(prev => prev.map(prayer => ({
        ...prayer,
        isPrayed: false,
        prayedTime: undefined,
        delay: 0
      })));
    }
  };

  const savePrayerData = (updatedPrayers: Prayer[]) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    localStorage.setItem(`prayers-${dateKey}`, JSON.stringify(updatedPrayers));
    setPrayers(updatedPrayers);
  };

  const calculateDelay = (adhanTime: string, prayedTime: string): number => {
    const [adhanHour, adhanMin] = adhanTime.split(':').map(Number);
    const [prayedHour, prayedMin] = prayedTime.split(':').map(Number);
    
    const adhanMinutes = adhanHour * 60 + adhanMin;
    const prayedMinutes = prayedHour * 60 + prayedMin;
    
    return Math.max(0, prayedMinutes - adhanMinutes);
  };

  const updatePrayerTime = (index: number, time: string) => {
    const updatedPrayers = [...prayers];
    updatedPrayers[index].prayedTime = time;
    updatedPrayers[index].delay = calculateDelay(updatedPrayers[index].adhanTime, time);
    savePrayerData(updatedPrayers);
  };

  const togglePrayerStatus = (index: number) => {
    const updatedPrayers = [...prayers];
    updatedPrayers[index].isPrayed = !updatedPrayers[index].isPrayed;
    
    if (!updatedPrayers[index].isPrayed) {
      updatedPrayers[index].prayedTime = undefined;
      updatedPrayers[index].delay = 0;
    }
    
    savePrayerData(updatedPrayers);
  };

  const getCompletionPercentage = () => {
    const completed = prayers.filter(p => p.isPrayed).length;
    return Math.round((completed / prayers.length) * 100);
  };

  const getDelayStatus = (delay: number) => {
    if (delay === 0) return 'on-time';
    if (delay <= 30) return 'late';
    return 'very-late';
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-lg">
            <Clock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">مواقيت الصلاة</h2>
            <p className="text-sm text-muted-foreground">تتبع أداء الصلوات اليومية</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{getCompletionPercentage()}%</div>
          <div className="text-sm text-muted-foreground">نسبة الإتمام</div>
        </div>
      </div>

      <div className="space-y-4">
        {prayers.map((prayer, index) => (
          <div key={prayer.name} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{prayer.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">الأذان:</span>
                  <span className="font-mono font-medium">{prayer.adhanTime}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="time"
                    value={prayer.prayedTime || ''}
                    onChange={(e) => updatePrayerTime(index, e.target.value)}
                    disabled={!prayer.isPrayed}
                    className="text-sm"
                    placeholder="وقت الصلاة"
                  />
                </div>
                
                {prayer.isPrayed && prayer.prayedTime && (
                  <div className="flex items-center gap-2">
                    {prayer.delay === 0 ? (
                      <CheckCircle className="w-4 h-4 text-prayer-on-time" />
                    ) : prayer.delay <= 30 ? (
                      <AlertCircle className="w-4 h-4 text-prayer-late" />
                    ) : (
                      <XCircle className="w-4 h-4 text-prayer-missed" />
                    )}
                    <span className={`text-sm font-medium ${
                      prayer.delay === 0 ? 'text-prayer-on-time' :
                      prayer.delay <= 30 ? 'text-prayer-late' : 'text-prayer-missed'
                    }`}>
                      {prayer.delay === 0 ? 'في الوقت' : `تأخر ${prayer.delay} دقيقة`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => togglePrayerStatus(index)}
              variant={prayer.isPrayed ? "default" : "outline"}
              size="sm"
              className={`min-w-[80px] ${
                prayer.isPrayed 
                  ? 'bg-gradient-to-r from-success to-prayer-on-time text-white' 
                  : ''
              }`}
            >
              {prayer.isPrayed ? (
                <>
                  <CheckCircle className="w-4 h-4 ml-1" />
                  صليت
                </>
              ) : (
                'لم أصل'
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">إجمالي الصلوات المؤداة اليوم</span>
          <span className="text-lg font-bold text-primary">
            {prayers.filter(p => p.isPrayed).length} من {prayers.length}
          </span>
        </div>
      </div>
    </div>
  );
};