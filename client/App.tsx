import { View, Text, Button, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Touchable, SectionList, Image } from "react-native"
import "./global.css"
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { ip, version } from "./config"
import dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime'
import Icon from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import Notification from "./Screens/Notification"
import LottieView from 'lottie-react-native'

const Stack = createNativeStackNavigator()

dayjs.extend(relativeTime);

interface LogInterface {
  id: number,
  barcode: string,
  name: string,
  old_qty: number,
  new_qty: number,
  timestamp: string
}

interface ProductInterface {
  barcode: string,
  name: string,
  qty: number
}

const Warp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="Home" component={App}></Stack.Screen>
        <Stack.Screen name="Notification" component={Notification}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}


const App = () => {

  let navigation = useNavigation()

  const device = useCameraDevice('front') // mywebcam
  const { hasPermission, requestPermission } = useCameraPermission()
  const [open, setOpen] = useState<boolean>(false)

  const [active, setActive] = useState(false)

  const [logs, setLogs] = useState<LogInterface[]>([])
  const [specific_product, setSpecificProduct] = useState<ProductInterface[]>([])
  const [modal, setModal] = useState<boolean>(false)
  const [newqty, setNewQty] = useState<number>(0)

  const [refresh, setRefresh] = useState<number>(0)

  const [found, setFound] = useState<boolean>(false)

  const finder = useRef(null)

  const requestCameraPermissions = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    const microphonePermission = await Camera.requestMicrophonePermission();

    if (cameraPermission === 'denied' || microphonePermission === 'denied') {
      console.warn('Camera or microphone permissions denied.');
    }
  };

  // console.log("DEVICE : ", device)
  // console.log("PM : ", hasPermission)

  const GetLogs = (): Promise<LogInterface[]> => {
    return new Promise((resolve) => {
      axios.get(`${ip}/api/logs`).then((res) => {
        resolve(res.data)
      })
    })
  }

  const GetProduct = (barcode: string): Promise<ProductInterface[]> => {
    return new Promise((resolve) => {
      axios.get(`${ip}/api/product/${barcode}`).then((res) => {
        resolve(res.data)
      })
    })
  }

  const UpdateProduct = (item: ProductInterface) => {
    return new Promise((resolve) => {

      // let year = dayjs().year()
      // let month = dayjs().month()
      // let date = String(dayjs().date()).padStart(2, '0');
      // let hours = String(dayjs().hour()).padStart(2, '0');
      // let min = String(dayjs().minute()).padStart(2, '0');
      // let sec = String(dayjs().second()).padStart(2, '0');

      // let concatnate = `${year}-${month}-${date} ${hours}:${min}:${sec}`

      // console.log(concatnate)


      axios.patch(`${ip}/api/update_quantity`, {
        barcode: item.barcode,
        name: item.name,
        current: item.qty,
        qty: newqty
      }).then((res) => {
        resolve(res.data)
      })
    })
  }

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128', "aztec", "codabar", "code-39", "code-93", "data-matrix", "ean-13", "ean-8"],
    onCodeScanned(codes) {
      if (!modal && !found) {
        console.log(codes[0].type)
        console.log(codes[0].value)



        const getData = async (code: any) => {

          let product = await GetProduct(code.value)

          console.log("PRODUCT TEST : ", product)

          if (product && product.length > 0) {
            setModal(true)
            setSpecificProduct(product)
            setFound(true)
            setTimeout(() => {
              setFound(false)
            }, 2000)
          } else {
            Alert.alert("ไม่พบสินค้า")
            setFound(true)
            setTimeout(() => {
              setFound(false)
            }, 3000)
          }
        }

        getData(codes[0])
      }
    },
  })

  const initial = async () => {
    console.log("INITIAL CHECKKK")
    let logsarray = await GetLogs()

    // console.log(logsarray)

    setLogs(logsarray)
  }

  useEffect(() => {
    initial()
    requestCameraPermissions()
    // if (device) {
    //   Camera.requestCameraPermission().then((res) => {
    //     console.log(res, "Successfully Granted")
    //   })
    // }
  }, [refresh])

  if (device == null) {
    return (
      <View>
        <Text>Not found</Text>
      </View>
    )
  }

  // 0000000328811

  return (
    <View className="h-[100vh] flex bg-white">

      <View className="flex justify-center bg-blue-600/60 h-[60px] p-[10px]">
        <View className="flex flex-row justify-between w-full">
          <View>
            <Text className="font-[medium] text-[20px] text-white mb-[-5px]">ตรวจนับสินค้าในสต๊อก</Text>
            <Text className="font-[light] text-[14px] text-white">Stock Manangement</Text>
          </View>
          <View className="items-center flex justify-center">
            <Icon onPress={() => {
              //@ts-ignore
              navigation.navigate('Notification')
            }} name="cart" size={30} color={'white'}></Icon>
            {/* <Icon onPress={() => {
              //@ts-ignore
              navigation.navigate('Notification')
            }} name="fa-info" size={30}></Icon> */}
          </View>
        </View>
      </View>


      {!open ? <View className="bottom-[80px] absolute left-[50%] translate-x-[-50%]">
        <Text>Reserved by Rattanon Boonmata Copyrights</Text>
        <View className="flex justify-center items-center">
          <Text>version : {version}</Text>
          <Text>target : {ip}</Text>
        </View>
      </View> : null}

      {!open ? null : <View style={{ height: 300 }} >
        {device ?
          <Camera style={{ flex: 1 }} codeScanner={codeScanner} device={device} isActive={open} />
          : null}
        <TouchableOpacity onPress={() => {
          setOpen(false)
        }} className="w-full h-[40px] bg-black flex justify-center items-center absolute bottom-0 z-3">
          <Text className="text-white font-[medium]">ปิด</Text>
        </TouchableOpacity>
        <View className={`w-[150px] h-[150px] border-[2px] ${found ? 'border-green-700' : 'border-green-500'} absolute z-3 top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]`}></View>
      </View>}

      {modal && specific_product && specific_product.length > 0 ? <View onTouchStart={(e) => {
        if (e.currentTarget == e.target) {
          setModal(false)
          setSpecificProduct([])
          if (finder && finder.current) {
            //@ts-ignore
            finder.current.clear()
          }
        }
      }} className="w-[100%] h-full bg-black/40 absolute top-0 left-0 z-[3] flex justify-center items-center">
        <View className="w-[250px] p-[20px] h-[200px] bg-white rounded-[8px] flex justify-center items-center gap-5">
          <View className="flex justify-center items-center">
            <Text className="font-[medium]">{specific_product[0].name}</Text>
            <Text className="text-[12px] font-[light]">{specific_product[0].barcode}</Text>
          </View>
          {specific_product && specific_product.length > 0 ? <TextInput autoFocus className="w-full text-center h-[50px] border-[1px] rounded-[4px] border-black/30" placeholder={specific_product[0].qty.toString()} onChangeText={(text) => {
            setNewQty(parseInt(text))
          }}></TextInput> : null}
          <View className="flex flex-row gap-[20px]">
            <Button onPress={() => {
              UpdateProduct(specific_product[0])
              setModal(false)
              setSpecificProduct([])
              setRefresh(refresh + 1)

              // Alert.alert("อัพเดทสำเร็จ!", "", [{onPress: ()=>{
              //   setRefresh(refresh+1)
              // }}])

              // if (finder && finder.current) {
              //   //@ts-ignore
              //   finder.current.clear()
              //   Alert.alert("อัพเดทสำเร็จ!")
              // }
            }} title="Update"></Button>
            <Button color={'red'} onPress={() => {
              setModal(false)
              setSpecificProduct([])
            }} title="Cancel"></Button>
          </View>
        </View>
      </View>
        : null}

      <View className="p-[20px] flex justify-center items-center">

        {/* <Text className="text-[30px] text-blue-500 font-[medium]">PlayScanner</Text>
<Text className="text-[20px] text-black font-[regular]">แสกนได้อย่างมั่นใจไร้กังวล</Text>
<TouchableOpacity onPress={(e) => {
  setActive(!active)
}} className="w-[200px] h-[50px] flex justify-center items-center bg-black rounded-full mt-[20px]"><Text className="text-white text-[20px] font-[medium]">Scan</Text></TouchableOpacity> */}
        {/* <Camera style={StyleSheet.absoluteFill} device={device} isActive={true}></Camera> */}


        <TouchableOpacity onPress={() => {
          setOpen(true)
        }} className="mb-[10px] flex justify-center items-center">
          <View className="flex flex-row gap-[5px] items-center">
            <Text className="font-[medium] text-[20px]">ถ่ายรูปบาร์โค้ด</Text>
            <Icon name="camera" size={30} color="#000" />
          </View>
          {open ? <Text className="font-[light] text-green-600">กำลังเปิดใช้งาน</Text> : null}
        </TouchableOpacity>

        <TextInput ref={finder} onChangeText={async (text) => {
          let product = await GetProduct(text)
          if (product && product.length > 0) {
            setModal(true)
            setSpecificProduct(product)
          } else {
            Alert.alert("Not found")
          }

        }} placeholder={`${open ? 'ปิดกล้องเพื่อใช้งาน' : 'สแกนบาร์โค้ด'}`} editable={open ? false : true} className={`border-[1px] w-full rounded-[8px] text-center font-[light] border-black/30 mb-[40px] ${open ? 'bg-black/20' : 'bg-white'}`}></TextInput>


        <ScrollView className="h-[400px] w-full border-[1px] border-black/20 p-[10px] rounded-[8px] ">
          <View className="header flex flex-row items-center w-full border-b-[1px] border-black">

            <View className="w-[10%] flex justify-center items-center">
              <Text className="font-[medium]">ID</Text>
            </View>

            <View className="flex flex-col w-full justify-center items-center">
              <View className="w-full flex flex-row">
                <View className="w-[30%] flex justify-center items-center">
                  <Text className="font-[light]">รายการสินค้า</Text>
                </View>
                <View className=" w-[60%] flex">
                  <View className="flex w-full justify-center items-center bg-black/80">
                    <Text className="font-[medium] text-white">จำนวนสินค้า</Text>
                  </View>
                  <View className="flex flex-row w-full">
                    <View className="w-[33.33%] flex justify-center items-center bg-blue-400/90">
                      <Text className="font-[light] text-white">คงเหลือ</Text>
                    </View>
                    <View className="w-[33.33%] flex justify-center items-center bg-green-600/90">
                      <Text className="font-[light] text-white">ยอดล่าสุด</Text>
                    </View>
                    <View className="w-[33.33%] flex justify-center items-center bg-red-500/90">
                      <Text className="font-[light] text-white">ส่วนต่าง</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

          </View>


          <View className="body ">
            {logs && logs.length > 0 ? logs.map((item: LogInterface, index: number) => {
              return (
                <View key={item.id} className={`flex flex-row justify-around border-b-[1px] border-black h-[50px] ${index % 2 == 0 ? 'bg-slate-200' : 'bg-white'}`}>
                  <View className="w-[10%] flex justify-center items-center">
                    <Text className="font-[medium]">{item.id}</Text>
                  </View>
                  <View className="w-[30%] flex justify-center items-center">
                    <Text numberOfLines={1} className="font-[light]">{item.name}</Text>
                    <Text numberOfLines={1} className="font-[light] text-[12px] opacity-[50%]">{dayjs(Number(item.timestamp)).fromNow()}</Text>
                  </View>
                  <View className="w-[20%] flex justify-center items-center">
                    <Text className="font-[medium]">{item.old_qty}</Text>
                  </View>
                  <View className="w-[20%] flex justify-center items-center">
                    <Text className="font-[medium]">{item.new_qty}</Text>
                  </View>
                  <View className="w-[20%] flex justify-center items-center">
                    <Text className="font-[medium]">{(item.new_qty - item.old_qty) > 0 ? '+' + (item.new_qty - item.old_qty) : (item.new_qty - item.old_qty)}</Text>
                  </View>
                </View>
              )
            }) : <View className="w-full h-full flex justify-center items-center">
              {/* <Text className="font-[light]">server is not response</Text> */}
              <LottieView style={{ width: 200, height: 300 }} source={require('./loading.json')} autoPlay loop></LottieView>
            </View>}
          </View>
        </ScrollView>

        {/* <View className="h-[400px] w-full">
          <ScrollView scrollEnabled className="w-[100%] h-full rounded-[8px] p-[10px] border-[1px] border-black/30">
            {logs && logs.length > 0 ? logs.map((item: LogInterface) => {
              return (
                <View className="flex flex-row mb-[10px] justify-between" key={item.id}>
                  <View className="flex flex-row gap-2">
                    <Text className="font-[medium]">{item.id}.</Text>
                    <View>
                      <Text numberOfLines={1} className="font-[medium] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</Text>
                      <Text className="font-[light] text-[14px]">{item.barcode}</Text>
                      <Text>{dayjs(Number(item.timestamp)).fromNow()}</Text>
                    </View>
                  </View>
                  <View className="flex flex-row gap-1 justify-center items-center">
                    <View className="w-[50px] h-[40px] rounded-[4px] bg-red-500 flex justify-center items-center">
                      <Text className=" text-center text-white font-[medium]">{item.old_qty}</Text>
                    </View>

                    <Text className="font-[bold]">-</Text>
                    <View className="w-[50px] h-[40px] rounded-[4px] bg-green-500 flex justify-center items-center">
                      <Text className="text-center w-[50px] text-white font-[medium]">{item.new_qty}</Text>
                    </View>

                    <View className="w-[50px] h-[40px] rounded-[4px] bg-black flex justify-center items-center">
                      <Text className="text-center w-[50px] text-white font-[medium]">{(item.new_qty - item.old_qty) > 0 ? `+${item.new_qty - item.old_qty}` : item.new_qty - item.old_qty}</Text>
                    </View>
                  </View>
                </View>
              )
            }) : null}
          </ScrollView>
        </View> */}
      </View>
    </View>
  )
}


export default Warp