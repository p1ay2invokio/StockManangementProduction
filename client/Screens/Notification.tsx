import axios from "axios"
import { View, Text } from "react-native"
import { ip } from "../config"
import { useEffect, useState } from "react"
import LottieView from "lottie-react-native"

interface NotificationInterface {
    Id: number,
    Message: string
}

const Notification = () => {

    let [notificationItem, setNotificationItem] = useState<NotificationInterface[]>([])

    const getNotificationItems = (): Promise<NotificationInterface[]> => {
        return new Promise((resolve) => {
            axios.get(`${ip}/api/notifications`).then((res) => {
                resolve(res.data)
            })
        })
    }

    const initial = async () => {
        const notifications = await getNotificationItems()

        console.log(notifications)
        setNotificationItem(notifications)
    }

    useEffect(() => {
        initial()
    }, [])

    return (
        <View className="flex justify-center items-center p-[20px]">
            <Text className="font-[medium] text-[20px]">แจ้งเตือนสินค้า</Text>

            <View className="mt-[20px] w-full">
                {notificationItem && notificationItem.length > 0 ? notificationItem.map((item) => {

                    let ItemName = item.Message.split('คงเหลือ')[0]
                    let ItemQty = item.Message.split('คงเหลือ')[1]

                    return (
                        <View key={item.Id} className="flex flex-row w-full justify-between">
                            <View className="w-[50%]">
                                <Text className="font-[medium]">{ItemName}</Text>
                            </View>
                            <View className="w-[50%]">
                                <Text className="font-[light]">{ItemQty}</Text>
                            </View>
                        </View>
                    )
                }) : <View className="w-full flex justify-center items-center">
                    <LottieView style={{width: 200, height: 100}} source={require("../loading.json")} autoPlay loop></LottieView>
                </View>}
            </View>
        </View>
    )
}

export default Notification