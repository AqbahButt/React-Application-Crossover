import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

// Define the types for the data
type ChoiceType = string;

interface DataType {
  id: string;
  avatar: string;
  author: string;
  content: string;
  choices: ChoiceType[];
}

// Timer Component
const Timer = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return <Text style={styles.timer}>{formatTime(time)}</Text>;
};

const HomeScreen = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<DataType[]>('https://cross-platform.rp.devfactory.com/for_you');
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load content');
      setLoading(false);
    }
  };

  const revealAnswer = async (id: string) => {
    try {
      const response = await axios.get<{ correct: string }>(`https://cross-platform.rp.devfactory.com/reveal?id=${id}`);
      setCorrectAnswer((prev) => ({ ...prev, [id]: response.data.correct }));
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }: { item: DataType }) => (
    <View style={styles.itemContainer}>
      <View style={styles.userContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.author}>{item.author}</Text>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.choicesContainer}>
        {item.choices.map((choice, index) => (
          <TouchableOpacity key={index} onPress={() => revealAnswer(item.id)}>
            <Text style={[styles.choice, correctAnswer[item.id] === choice ? styles.correct : null]}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={fetchData}
        onEndReachedThreshold={0.5}
      />
      <Timer />
      <View style={styles.iconContainer}>
        <TouchableOpacity>
          <Icon name="thumbs-up" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="comment" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="share" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="bookmark" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  author: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 18,
    marginBottom: 10,
  },
  choicesContainer: {
    marginTop: 10,
  },
  choice: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 5,
  },
  correct: {
    backgroundColor: '#d4edda',
  },
  timer: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default HomeScreen;
