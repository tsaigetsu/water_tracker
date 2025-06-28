import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  onEditUser: () => void;
};

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, onEditUser }) => {
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmitHelp = () => {
    // Валидация (при желании можно усилить)
    if (!name || !email || !description) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    // Можно здесь отправить запрос или обработать
    console.log('Отправка помощи:', { name, email, description });

    // Очистка и закрытие
    setName('');
    setEmail('');
    setDescription('');
    setShowHelpForm(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {!showHelpForm ? (
              <>
                <Text style={styles.title}>Меню</Text>
                <TouchableOpacity style={styles.button} onPress={onEditUser}>
                  <Text style={styles.buttonText}>Изменить данные</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => alert('Этот открытый проект посвящен контролю за собственным насыщением воды и в будущем другими напитками, отслеживанием водного баланса и напоминанию о том, что вода - один из ключевых элементов здоровья. ')}>
                  <Text style={styles.buttonText}>О проекте</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setShowHelpForm(true)}>
                  <Text style={styles.buttonText}>Помощь</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeText}>Закрыть</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Форма помощи</Text>
                <TextInput
                  placeholder="Имя"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  placeholder="Почта"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <TextInput
                  placeholder="Опишите проблему"
                  placeholderTextColor="#666"
                  style={[styles.input, { height: 80 }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmitHelp}>
                  <Text style={styles.buttonText}>Отправить</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHelpForm(false)}>
                  <Text style={styles.closeText}>Назад</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MenuModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
