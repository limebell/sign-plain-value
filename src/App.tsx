import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useAccounts, useConnect, useNetwork } from "@planetarium/chrono-sdk/hooks";
import { Inner } from "./Inner";
import { getChronoSdk } from "@planetarium/chrono-sdk";

function App() {
	const {
		data: accountsData,
		isLoading: accountsLoading,
		isSuccess: accountsSuccess,
		error: accountsError,
	} = useAccounts();
	const { connectAsync, isPending } = useConnect();
	const {
		data: networksData,
		isLoading: networksLoading,
		isSuccess: networksSuccess,
	} = useNetwork();

	const chronoWallet = getChronoSdk();

	if (chronoWallet === undefined) {
		return (
			<div className="flex flex-col bg-gray-900 justify-center items-center min-w-screen min-h-screen">
				There is no Chrono Wallet. You should install Chrono wallet first to use
				this app.
			</div>
		);
	}

	if (accountsLoading || networksLoading) {
		return <>Loading...</>;
	}

	if (!accountsSuccess) {
		return <>Accounts are not loaded successful. error: {accountsError}</>;
	}

	if (!networksSuccess) {
		return <>Network is not loaded successful.</>;
	}

	const { accounts, isConnected } = accountsData;
	const { network, isConnected: networkIsConnected } = networksData;

	if (!isConnected || !networkIsConnected) {
		return (
			<div className="flex flex-col bg-gray-900 justify-center items-center min-w-screen min-h-screen">
				<p className="text-white mb-6 text-lg font-bold">
					You must connect (allow) this site on Chrono first.
				</p>
				{isPending || (
					<button
						className="bg-white p-4 font-bold"
						onClick={() => connectAsync()}
					>
						Connect
					</button>
				)}
				{isPending && (
					<button
						className="bg-white p-4 font-bold"
						disabled
						onClick={() => connectAsync()}
					>
						Connecting
					</button>
				)}
			</div>
		);
	}

	if (!network.gqlEndpoint) {
		return <>No GraphQL endpoint found for the network.</>;
	}

	const client = new ApolloClient({
		uri: network.gqlEndpoint,
		cache: new InMemoryCache(),
	});

	return (
		<ApolloProvider client={client}>
			<Inner accounts={accounts} chronoWallet={chronoWallet} />
		</ApolloProvider>
	);
}

export default App;
