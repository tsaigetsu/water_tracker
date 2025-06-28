import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Pressable, TextInput, Alert, Platform,
  Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import DateTimePicker from '@react-native-community/datetimepicker';
import Glass from '../../components/Glass';
import MenuModal from '../../components/Modal';
import { useColorScheme } from 'react-native';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const [setupStep, setSetupStep] = useState(0);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [wakeTime, setWakeTime] = useState(new Date());
  const [sleepTime, setSleepTime] = useState(new Date());
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const wakeTimer = useRef<NodeJS.Timeout | null>(null);
  const sleepTimer = useRef<NodeJS.Timeout | null>(null);

  const [water, setWater] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [waterGoal, setWaterGoal] = useState(2000);

  const [menuVisible, setMenuVisible] = useState(false);
  const [infoModal, setInfoModal] = useState<null | 'about' | 'help'>(null);

  const [selectedDrink, setSelectedDrink] = useState('вода');

  const TIMEOUT_DURATION = 7000;

  const calculateWaterGoal = (weightKg: number): number => {
    const base = 1500;
    const extra = Math.max(weightKg - 20, 0) * 20;
    return base + extra;
  };

  const waterPercent = Math.min(water / waterGoal, 1);

  const colorScheme = useColorScheme(); // 'light' | 'dark' | null
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const [drinkProgress, setDrinkProgress] = useState({
    вода: 0,
    сок: 0,
    пиво: 0,
    вино: 0,
    энергетик: 0,
  });

  const drinkColors: { [key: string]: string } = isDark
    ? {
        вода: '#00b4d8',
        сок: '#f4a261',
        пиво: '#e9c46a',
        вино: '#9d4edd',
        энергетик: '#ff006e',
      }
    : {
        вода: '#0077b6',
        сок: '#e76f51',
        пиво: '#f9c74f',
        вино: '#8338ec',
        энергетик: '#ff0054',
      };


  useEffect(() => {
    const loadData = async () => {
      try {
        const h = await AsyncStorage.getItem('height');
        const w = await AsyncStorage.getItem('weight');
        const g = await AsyncStorage.getItem('gender');
        const wake = await AsyncStorage.getItem('wakeTime');
        const sleep = await AsyncStorage.getItem('sleepTime');
        const storedProgress = await AsyncStorage.getItem('drinkProgress');
        if (storedProgress) {
          setDrinkProgress(JSON.parse(storedProgress));
        }
        const weightNum = parseInt(weight);

        if (h && w && g && wake && sleep) {
          setHeight(h);
          setWeight(w);
          setGender(g as 'male' | 'female');
          setWakeTime(new Date(wake));
          setSleepTime(new Date(sleep));
          setWaterGoal(calculateWaterGoal(weightNum));
          setSetupStep(0);
        }

        if (storedWater) setWater(parseInt(storedWater));
      } catch (e) {
        console.warn('Ошибка загрузки данных', e);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
  AsyncStorage.setItem('drinkProgress', JSON.stringify(drinkProgress));
}, [drinkProgress]);

  useEffect(() => {
    const setupNotifications = async () => {
      if (!Device.isDevice) {
        Alert.alert('Уведомления работают только на реальном устройстве');
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Нет разрешения на уведомления');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Напоминание",
          body: "Пора выпить воды!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 30,
          repeats: true,
        },
      });
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    return () => {
      if (wakeTimer.current) clearTimeout(wakeTimer.current);
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
    };
  }, []);

  useEffect(() => {
    if (setupStep === 2) {
      setModalVisible(false);
      setMenuVisible(false);
      setCustomAmount('');
      setInfoModal(null);
    }
  }, [setupStep]);

  const resetWakeTimer = () => {
    if (wakeTimer.current) clearTimeout(wakeTimer.current);
    wakeTimer.current = setTimeout(() => {
      setShowWakePicker(false);
    }, TIMEOUT_DURATION);
  };

  const resetSleepTimer = () => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    sleepTimer.current = setTimeout(() => {
      setShowSleepPicker(false);
    }, TIMEOUT_DURATION);
  };

  const onWakeTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setWakeTime(selectedDate);
    }
    if (Platform.OS === 'ios') {
      resetWakeTimer();
    } else {
      setShowWakePicker(false);
    }
  };

  const onSleepTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setSleepTime(selectedDate);
    }
    if (Platform.OS === 'ios') {
      resetSleepTimer();
    } else {
      setShowSleepPicker(false);
    }
  };

  const openWakePicker = () => {
    setShowWakePicker(true);
    if (Platform.OS === 'ios') {
      resetWakeTimer();
    }
  };

  const openSleepPicker = () => {
    setShowSleepPicker(true);
    if (Platform.OS === 'ios') {
      resetSleepTimer();
    }
  };

  const handleSaveParams = async () => {
    const weightNum = parseInt(weight);
    if (!height || !weight || !gender) {
      Alert.alert('Пожалуйста, заполните все поля');
      return;
    }
    await AsyncStorage.setItem('height', height);
    await AsyncStorage.setItem('weight', weight);
    await AsyncStorage.setItem('gender', gender);
    setWaterGoal(calculateWaterGoal(weightNum));
    setSetupStep(1);
  };

  const handleSaveActivityTime = async () => {
    await AsyncStorage.setItem('wakeTime', wakeTime.toISOString());
    await AsyncStorage.setItem('sleepTime', sleepTime.toISOString());
    setSetupStep(2);
  };

  const handleAddWater = (amount: number) => {
    setWater(prev => prev + amount);
    setDrinkProgress(prev => ({
      ...prev,
      [selectedDrink]: prev[selectedDrink] + amount,
    }));
    setModalVisible(false);
    setCustomAmount('');
  };

  const handleAddCustom = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Некорректное значение");
      return;
    }
    handleAddWater(amount);
  };

  if (setupStep === 0) {
    return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>Параметры пользователя</Text>

      <TextInput
        placeholder="Рост (см)"
        placeholderTextColor="#666"
        keyboardType="numeric"
        style={styles.input}
        value={height}
        onChangeText={setHeight}
      />

      <TextInput
        placeholder="Вес (кг)"
        placeholderTextColor="#666"
        keyboardType="numeric"
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
      />

      <View style={{ flexDirection: 'row', marginVertical: 20 }}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'male' && styles.genderButtonSelected,
          ]}
          onPress={() => setGender('male')}
        >
          <Text style={gender === 'male' ? styles.genderTextSelected : styles.genderText}>
            Мужской
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'female' && styles.genderButtonSelected,
          ]}
          onPress={() => setGender('female')}
        >
          <Text style={gender === 'female' ? styles.genderTextSelected : styles.genderText}>
            Женский
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSaveParams}>
        <Text style={styles.buttonText}>Далее</Text>
      </TouchableOpacity>
    </View>
  </TouchableWithoutFeedback>
);
  }

  if (setupStep === 1) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Время активности</Text>

          <Text>Во сколько вы просыпаетесь?</Text>
          <TouchableOpacity onPress={openWakePicker} style={styles.timePickerButton}>
            <Text style={styles.timeText}>
              {wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showWakePicker && (
            <DateTimePicker value={wakeTime} mode="time" is24Hour display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onWakeTimeChange} />
          )}

          <Text style={{ marginTop: 20 }}>Во сколько вы ложитесь спать?</Text>
          <TouchableOpacity onPress={openSleepPicker} style={styles.timePickerButton}>
            <Text style={styles.timeText}>
              {sleepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showSleepPicker && (
            <DateTimePicker value={sleepTime} mode="time" is24Hour display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onSleepTimeChange} />
          )}

          <TouchableOpacity style={styles.button} onPress={handleSaveActivityTime}>
            <Text style={styles.buttonText}>Готово</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Кнопка меню */}
        <TouchableOpacity
          style={[styles.button, { position: 'absolute', top: 40, right: 20 }]}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.buttonText}>☰</Text>
        </TouchableOpacity>

        {/* Фон-заливка */}
        {Object.entries(drinkProgress).map(([drink, amount]) => {
          const percent = Math.min(amount / waterGoal, 1);
          if (percent === 0) return null;
          return (
            <View
              key={drink}
              style={[
                styles.fillBackground,
                {
                  height: `${percent * 100}%`,
                  backgroundColor: drinkColors[drink as keyof typeof drinkColors],
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: -1,
                  opacity: 0.6,
                }
              ]}
            />
          );
        })}

        {/* Выбор напитка */}
        <View style={styles.drinkSelector}>
          {['вода', 'сок', 'пиво', 'вино', 'энергетик'].map((drink) => (
            <TouchableOpacity
              key={drink}
              style={[
                styles.drinkButton,
                selectedDrink === drink && styles.drinkButtonSelected
              ]}
              onPress={() => setSelectedDrink(drink)}
            >
              <Text
                style={selectedDrink === drink
                  ? styles.drinkTextSelected
                  : styles.drinkText}
              >
                {drink}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Счетчик */}
        <Text style={styles.counter}>
          {water} мл из {waterGoal} мл
        </Text>

        {/* Кнопка добавления */}
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Добавить воду</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 18, marginBottom: 10 }}>Сколько выпито?</Text>
              <TextInput
                placeholder="Свое значение"
                placeholderTextColor="#666"
                keyboardType="numeric"
                style={styles.input}
                value={customAmount}
                onChangeText={setCustomAmount}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  handleAddCustom();
                }}
              />
              <Pressable style={styles.modalButton} onPress={handleAddCustom}>
                <Text>Добавить</Text>
              </Pressable>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ marginTop: 10, color: '#888' }}>Отмена</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEditUser={() => {
          setSetupStep(0);
          setMenuVisible(false);
        }}
      />

      {/* Форма помощи (если активна) */}
      {infoModal === 'help' && (
        <Modal visible transparent animationType="slide">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Помощь</Text>
                <TextInput placeholder="Имя" placeholderTextColor="#666" style={styles.input} />
                <TextInput placeholder="Почта" placeholderTextColor="#666" style={styles.input} keyboardType="email-address" />
                <TextInput placeholder="Опишите проблему" placeholderTextColor="#666" style={[styles.input, { height: 100 }]} multiline />
                <TouchableOpacity style={styles.button} onPress={() => setInfoModal(null)}>
                  <Text style={styles.buttonText}>Отправить</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setInfoModal(null)}>
                  <Text style={{ color: '#888', marginTop: 10 }}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  </TouchableWithoutFeedback>
);
}
const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      marginBottom: 40,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      textAlign: 'center',
    },
    fillBackground: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: -1,
    },
    counter: {
      marginTop: 20,
      fontSize: 18,
      color: isDark ? '#fff' : '#000',
    },
    button: {
      marginTop: 30,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: isDark ? '#1e90ff' : '#0077b6',
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: '#00000088',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isDark ? '#222' : '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalButton: {
      padding: 10,
      marginVertical: 5,
      backgroundColor: isDark ? '#333' : '#e0f7fa',
      borderRadius: 5,
      width: 140,
      alignItems: 'center',
    },
    input: {
      borderWidth: 2,
      borderColor: isDark ? '#fff' : '#000',
      borderRadius: 5,
      width: 140,
      padding: 8,
      marginVertical: 10,
      textAlign: 'center',
      color: isDark ? '#fff' : '#000',
      backgroundColor: isDark ? '#111' : '#fff',
    },
    genderButton: {
      borderWidth: 2,
      borderColor: isDark ? '#fff' : '#0077b6',
      padding: 12,
      marginHorizontal: 10,
      borderRadius: 8,
      backgroundColor: 'transparent', // фон по умолчанию
    },
    genderText: {
      color: '#fff', // белый текст по умолчанию
    },
    genderButtonSelected: {
      backgroundColor: '#fff'
    },
    genderTextSelected: {
      color: '#000',
    },
    timePickerButton: {
      marginTop: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: isDark ? '#fff' : '#0077b6',
      borderRadius: 8,
      alignItems: 'center',
    },
    timeText: {
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    drinkSelector: {
      flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 20,
    },

    drinkButton: {
      borderWidth: 1,
      borderColor: '#fff',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      margin: 6,
    },

    drinkButtonSelected: {
      backgroundColor: '#fff',
    },

    drinkText: {
      color: '#fff',
      textAlign: 'center',
    },

    drinkTextSelected: {
      color: '#000',
      textAlign: 'center',
    },
  });