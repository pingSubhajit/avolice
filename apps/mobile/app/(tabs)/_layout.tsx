import {Tabs} from 'expo-router'

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false
			}}
		>
			<Tabs.Screen name="today" options={{title: 'Today'}} />
			<Tabs.Screen name="focus" options={{title: 'Focus'}} />
			<Tabs.Screen name="builder" options={{title: 'Builder'}} />
			<Tabs.Screen name="chat" options={{title: 'Chat'}} />
			<Tabs.Screen name="settings" options={{title: 'Settings'}} />
		</Tabs>
	)
}
