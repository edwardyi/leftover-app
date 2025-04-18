import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Platform, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '@env';


interface Product {
  id: number;
  name: string;
  price: number;
  distance: number;
  category: string;
  latitude: number;
  longitude: number;
  svgUrl: string;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 地球半徑 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HomeScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 25.033964,
    longitude: 121.564468,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState({ distance: '5', price: '', category: '' });
  const [tab, setTab] = useState<'map' | 'list'>('map');
  const { t, i18n: i18next } = useTranslation();

  useEffect(() => {
    axios.get(`${API_URL}/api/i18n`)
      .then(res => {
        Object.keys(res.data).forEach(lang => {
          i18n.addResourceBundle(lang, 'translation', res.data[lang].translation, true, true);
        });
      });
    // 取得商品資料
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  // 地圖中心為基準，計算每個商品距離
  const filteredProducts = products.filter(p => {
    const dist = getDistanceFromLatLonInKm(region.latitude, region.longitude, p.latitude, p.longitude);
    if (filter.distance && Number(filter.distance) < dist) return false;
    if (filter.price && Number(filter.price) < p.price) return false;
    if (filter.category && filter.category !== '' && filter.category !== p.category) return false;
    return true;
  });

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('無法取得定位權限');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const centerToProduct = (lat: number, lng: number) => {
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setTab('map');
  };

  // 條件渲染，Web 顯示提示
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text>地圖功能僅支援手機 App，請用 Expo Go 或模擬器測試</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.langBar}>
        <TouchableOpacity onPress={() => i18next.changeLanguage('zhTW')} style={styles.langBtn}><Text>繁體</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => i18next.changeLanguage('zhCN')} style={styles.langBtn}><Text>简体</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => i18next.changeLanguage('en')} style={styles.langBtn}><Text>EN</Text></TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setTab('map')} style={[styles.tabBtn, tab === 'map' && styles.tabBtnActive]}><Text style={tab === 'map' ? styles.tabTextActive : undefined}>地圖</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('list')} style={[styles.tabBtn, tab === 'list' && styles.tabBtnActive]}><Text style={tab === 'list' ? styles.tabTextActive : undefined}>列表</Text></TouchableOpacity>
      </View>
      <View style={styles.filterBar}>
        <TextInput
          style={styles.input}
          placeholder={t('distance')}
          keyboardType="numeric"
          value={filter.distance}
          onChangeText={v => setFilter(f => ({ ...f, distance: v }))}
        />
        <TextInput
          style={styles.input}
          placeholder={t('price')}
          keyboardType="numeric"
          value={filter.price}
          onChangeText={v => setFilter(f => ({ ...f, price: v }))}
        />
        <Picker
          selectedValue={filter.category}
          style={styles.input}
          onValueChange={(v: string) => setFilter(f => ({ ...f, category: v }))}
        >
          <Picker.Item label={t('all')} value="" />
          {categories.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      {tab === 'map' ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {userLocation && (
            <Marker coordinate={userLocation} title={t('currentPosition')} pinColor="#007aff" />
          )}
          {filteredProducts.map((p) => (
            <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} title={p.name}>
              <Callout>
                <View style={{ alignItems: 'center', minWidth: 120 }}>
                  <Image source={{ uri: p.svgUrl }} style={{ width: 40, height: 40, marginBottom: 4 }} />
                  <Text style={{ fontWeight: 'bold' }}>{p.name}</Text>
                  <Text>{t('productPrice')}: {p.price}</Text>
                  <Text>{t('productDistance')}: {getDistanceFromLatLonInKm(region.latitude, region.longitude, p.latitude, p.longitude).toFixed(2)} {t('km')}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <ScrollView style={styles.listWrap}>
          {filteredProducts.length === 0 && <Text style={{ textAlign: 'center', marginTop: 20 }}>無商品</Text>}
          {filteredProducts.map((p) => (
            <TouchableOpacity key={p.id} style={styles.listItem} onPress={() => centerToProduct(p.latitude, p.longitude)}>
              <Image source={{ uri: p.svgUrl }} style={{ width: 36, height: 36, marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold' }}>{p.name}</Text>
                <Text>{t('productPrice')}: {p.price}</Text>
                <Text>{t('productDistance')}: {getDistanceFromLatLonInKm(region.latitude, region.longitude, p.latitude, p.longitude).toFixed(2)} {t('km')}</Text>
              </View>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); centerToProduct(p.latitude, p.longitude); }} style={styles.centerBtn}>
                <Text style={{ color: '#007aff' }}>定位</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={styles.buttonWrap}>
        <Button title={t('getLocation')} onPress={getLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
    gap: 8,
    zIndex: 10,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: '#f3f3f3',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 20,
  },
  tabBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  tabBtnActive: {
    borderColor: '#007aff',
  },
  tabTextActive: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    minWidth: 80,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '65%',
  },
  listWrap: {
    width: '100%',
    maxHeight: '65%',
    paddingHorizontal: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#fafcff',
  },
  buttonWrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: '#e6f0ff',
  },
});
