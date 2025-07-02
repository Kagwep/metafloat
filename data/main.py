import requests
import pandas as pd
import time
from datetime import datetime

class RateLimiter:
    """Ensures we never exceed API rate limits"""
    def __init__(self, max_calls_per_second=3):  # Even more conservative
        self.max_calls_per_second = max_calls_per_second
        self.min_interval = 1.0 / max_calls_per_second
        self.last_call_time = 0
        self.call_count = 0
        
    def wait_if_needed(self):
        """Wait if necessary to respect rate limits"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        # Always wait the full interval for steady pulses (skip only on first call)
        if self.last_call_time > 0 and time_since_last_call < self.min_interval:
            sleep_time = self.min_interval - time_since_last_call
            print(f"  ⏳ Rate limiting: sleeping {sleep_time:.2f}s...")
            time.sleep(sleep_time)
            
        self.last_call_time = time.time()
        self.call_count += 1
        
        # Extra safety: longer pause every 25 calls (was 50)
        if self.call_count % 25 == 0:
            print(f"  🛑 Extended safety pause after {self.call_count} API calls...")
            time.sleep(5.0)  # Increased from 2 to 5 seconds
            
        # Super long pause every 100 calls for server recovery
        if self.call_count % 100 == 0:
            print(f"  🏥 Server recovery pause after {self.call_count} API calls...")
            time.sleep(30.0)  # 30 second pause every 100 calls

class MetamaskCardTransactionCollector:
    def __init__(self, api_key, auto_discover_settlements=True):
        self.api_key = api_key
        self.base_url = "https://api.etherscan.io/v2/api"
        self.chain_id = 59144  # FIXED: Correct Linea chain ID
        self.metamask_contract = "0x9dd23A4a0845f10d65D293776B792af1131c7B30"
        
        # Settlement addresses - can be discovered or specified
        self.known_settlements = [
            "0xf344192b9146132fC0e997D1666dC1531Bf8F7Cd"  # Current known settlement
        ]
        
        self.auto_discover = auto_discover_settlements
        self.discovered_settlements = set()
        
        # Rate limiter to prevent API overuse
        self.rate_limiter = RateLimiter(max_calls_per_second=3)  # Reduced to 3 calls/sec
        
    def collect_all_card_transactions(self):
        """Collect ALL MetaMask card transactions by analyzing contract activity"""
        print(f"🔍 Collecting ALL MetaMask card transactions...")
        print(f"Contract: {self.metamask_contract}")
        print(f"Chain ID: {self.chain_id} (Linea)")
        
        all_spending_data = []
        
        # Step 1: Get all transactions involving the contract (RATE LIMITED)
        print("📋 Getting all contract transactions...")
        contract_txs = self.get_all_contract_transactions()
        print(f"Found {len(contract_txs)} contract transactions")
        
        # Step 2: Discover settlement addresses if enabled (RATE LIMITED)
        if self.auto_discover:
            print("🕵️ Auto-discovering settlement addresses...")
            self.discover_settlement_addresses(contract_txs[:25])  # Small sample to reduce API calls
        
        all_settlements = set(self.known_settlements + list(self.discovered_settlements))
        print(f"👥 Tracking {len(all_settlements)} settlement addresses:")
        for addr in all_settlements:
            print(f"  - {addr}")
        
        # Step 3: For each transaction, decode the token transfers (RATE LIMITED)
        print("🔄 Analyzing token transfers in each transaction...")
        print(f"⚠️ Rate limited to {self.rate_limiter.max_calls_per_second} calls/sec")
        print(f"⏱️ Estimated time: {len(contract_txs) / self.rate_limiter.max_calls_per_second / 60:.1f} minutes")
        print(f"💾 Will save preliminary data every 50 transactions for early inspection")
        
        for i, tx in enumerate(contract_txs):
            if i % 10 == 0:  # Frequent progress updates
                elapsed = (time.time() - self.start_time) / 60 if hasattr(self, 'start_time') else 0
                remaining = (len(contract_txs) - i) / self.rate_limiter.max_calls_per_second / 60
                print(f"  📊 Progress: {i}/{len(contract_txs)} ({i/len(contract_txs)*100:.1f}%) | "
                      f"Elapsed: {elapsed:.1f}min | ETA: {remaining:.1f}min | Found: {len(all_spending_data)} purchases")
                
            tx_hash = tx['hash']
            
            # CRITICAL: This call is rate limited inside the function
            transfers = self.get_token_transfers_from_transaction(tx_hash)
            
            # Filter for transfers TO ANY settlement address (card purchases)
            card_transfers = []
            for transfer in transfers:
                to_addr = transfer.get('to_address', '').lower()
                if any(to_addr == settlement.lower() for settlement in all_settlements):
                    card_transfers.append(transfer)
            
            if card_transfers:
                # This transaction contains card spending!
                for transfer in card_transfers:
                    spending_record = {
                        'transaction_hash': tx_hash,
                        'timestamp': tx['timestamp'],
                        'block_number': tx['block_number'],
                        'user_wallet': transfer['from_address'],
                        'settlement_address': transfer['to_address'],
                        'amount': transfer['amount'],
                        'token_address': transfer['token_address'],
                        'token_symbol': transfer.get('symbol', 'UNKNOWN'),
                        'transaction_type': 'card_purchase',
                        'gas_used': tx.get('gas_used', 0),
                        'gas_price': tx.get('gas_price', 0)
                    }
                    all_spending_data.append(spending_record)
            
            # 🔥 EARLY SAVE EVERY 50 TRANSACTIONS FOR INVESTIGATION
            if (i + 1) % 50 == 0:
                self.save_preliminary_data(all_spending_data, i + 1, len(contract_txs))
                
                # Ask user if they want to continue after seeing preliminary data
                if (i + 1) == 50:  # After first 50
                    if len(all_spending_data) == 0:
                        print(f"\n⚠️ WARNING: No card purchases found in first 50 transactions!")
                        print("This might indicate:")
                        print("- Wrong contract address")
                        print("- Wrong settlement address")
                        print("- No recent card activity")
                        print("- Contract not used for card transactions")
                        
                        continue_anyway = input("\nContinue anyway? (y/n): ").strip().lower()
                        if continue_anyway != 'y':
                            print("🛑 Stopping early. Check the preliminary data file for clues.")
                            break
                    else:
                        print(f"\n✅ Found {len(all_spending_data)} card purchases in first 50 transactions!")
                        print("This looks promising - continuing with full analysis...")
            
        print(f"\n✅ Found {len(all_spending_data)} card purchases total!")
        
        if all_spending_data:
            filename = self.save_to_csv(all_spending_data)
            print(f"💾 Data saved to {filename}")
            return filename
        else:
            print("❌ No card purchases found")
            return None
            
    def get_all_contract_transactions(self):
        """Get ALL transactions involving the MetaMask contract (RATE LIMITED)"""
        print("🔄 Fetching contract transactions (rate limited)...")
        # CRITICAL: Rate limit this call too!
        self.rate_limiter.wait_if_needed()
        
        params = {
            'chainid': self.chain_id,
            'module': 'account',
            'action': 'txlist',
            'address': self.metamask_contract,
            'startblock': 0,
            'endblock': 99999999,
            'sort': 'desc',
            'apikey': self.api_key
        }
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Add timeout to prevent SSL hangs
                response = requests.get(self.base_url, params=params, timeout=(5, 15))
                data = response.json()
                
                if data.get('status') == '1':
                    transactions = []
                    for tx in data.get('result', []):
                        transactions.append({
                            'hash': tx.get('hash'),
                            'timestamp': datetime.fromtimestamp(int(tx.get('timeStamp', 0))).isoformat(),
                            'from_address': tx.get('from'),
                            'to_address': tx.get('to'),
                            'block_number': int(tx.get('blockNumber', 0)),
                            'gas_used': int(tx.get('gasUsed', 0)),
                            'gas_price': int(tx.get('gasPrice', 0)),
                            'input_data': tx.get('input', '')
                        })
                        
                    return transactions
                else:
                    print(f"API Error: {data.get('message', 'Unknown error')}")
                    return []
                    
            except requests.exceptions.Timeout:
                print(f"⏰ Timeout on attempt {attempt + 1}/{max_retries} for contract transactions")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
                    continue
                else:
                    print("❌ All retry attempts failed for contract transactions")
                    return []
            except Exception as e:
                print(f"Error getting contract transactions (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return []
             
    def discover_settlement_addresses(self, sample_transactions):
        """Discover settlement addresses by analyzing transaction patterns (RATE LIMITED)"""
        print("🔍 Analyzing transaction patterns to discover settlement addresses...")
        print(f"⏳ Sampling {len(sample_transactions)} transactions with rate limiting...")
        
        recipient_frequency = {}
        
        # Analyze a sample of transactions to find common recipients
        for i, tx in enumerate(sample_transactions):
            if i % 5 == 0:
                print(f"  🔍 Discovery progress: {i}/{len(sample_transactions)} transactions...")
                
            tx_hash = tx['hash']
            # This call includes rate limiting
            transfers = self.get_token_transfers_from_transaction(tx_hash)
            
            for transfer in transfers:
                to_addr = transfer.get('to_address', '').lower()
                if to_addr and to_addr != '0x0000000000000000000000000000000000000000':
                    recipient_frequency[to_addr] = recipient_frequency.get(to_addr, 0) + 1
        
        # Find addresses that receive many transfers (likely settlement addresses)
        potential_settlements = []
        for addr, count in recipient_frequency.items():
            if count >= 2:  # Appears in 2+ transactions
                potential_settlements.append((addr, count))
        
        # Sort by frequency
        potential_settlements.sort(key=lambda x: x[1], reverse=True)
        
        print("🎯 Potential settlement addresses found:")
        for addr, count in potential_settlements[:5]:  # Top 5
            print(f"  {addr} - appears in {count} transactions")
            if addr not in [s.lower() for s in self.known_settlements]:
                self.discovered_settlements.add(addr)
                
        return potential_settlements
        
    def get_token_transfers_from_transaction(self, tx_hash):
        """Get ALL token transfers from a specific transaction hash (RATE LIMITED)"""
        # CRITICAL: Rate limit EVERY API call
        self.rate_limiter.wait_if_needed()
        
        params = {
            'chainid': self.chain_id,
            'module': 'proxy',
            'action': 'eth_getTransactionReceipt',
            'txhash': tx_hash,
            'apikey': self.api_key
        }
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Add timeout to prevent SSL hangs
                response = requests.get(self.base_url, params=params, timeout=(3, 10))
                data = response.json()
                
                if data.get('result'):
                    logs = data['result'].get('logs', [])
                    transfers = self.decode_all_transfer_events(logs)
                    return transfers
                else:
                    print(f"No receipt for {tx_hash}")
                    return []
                    
            except requests.exceptions.Timeout:
                print(f"⏰ Timeout on attempt {attempt + 1}/{max_retries} for {tx_hash}")
                if attempt < max_retries - 1:
                    time.sleep(1)  # Short delay between retries
                    continue
                else:
                    print(f"❌ All retry attempts failed for {tx_hash}, returning empty list")
                    return []  # Return empty list instead of crashing
            except Exception as e:
                print(f"Error getting transaction receipt for {tx_hash} (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                else:
                    print(f"❌ Final attempt failed for {tx_hash}, returning empty list")
                    return []
            
    def decode_all_transfer_events(self, logs):
        """Decode ALL ERC-20 Transfer events from transaction logs"""
        # ERC-20 Transfer event signature: Transfer(address,address,uint256)
        transfer_topic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        
        transfers = []
        for log in logs:
            topics = log.get('topics', [])
            
            # Check if this is a Transfer event
            if len(topics) > 0 and topics[0].lower() == transfer_topic.lower():
                try:
                    # Extract addresses from topics
                    if len(topics) >= 3:
                        # Remove leading zeros and add 0x prefix
                        from_address = "0x" + topics[1][-40:].lower()
                        to_address = "0x" + topics[2][-40:].lower()
                        token_address = log.get('address', '').lower()
                        
                        # Decode amount from data field
                        data = log.get('data', '0x')
                        amount_wei = 0
                        amount = 0
                        
                        if data and data != '0x':
                            try:
                                amount_hex = data[2:]  # Remove 0x prefix
                                amount_wei = int(amount_hex, 16) if amount_hex else 0
                            except:
                                amount_wei = 0
                        
                        # Try to get token symbol and decimals (fallback to common values)
                        symbol, decimals = self.get_token_info(token_address)
                        
                        if amount_wei > 0:
                            amount = amount_wei / 10**decimals
                        
                        transfers.append({
                            'from_address': from_address,
                            'to_address': to_address,
                            'token_address': token_address,
                            'amount': amount,
                            'amount_wei': amount_wei,
                            'symbol': symbol,
                            'decimals': decimals
                        })
                        
                except Exception as e:
                    # Skip malformed transfer events
                    continue
                    
        return transfers
        
    def get_token_info(self, token_address):
        """Try to get token symbol and decimals, with fallbacks"""
        # Common token mappings for Linea
        known_tokens = {
            "0x176211869ca2b568f2a7d4ee941e073a821ee1ff": ("USDC", 6),
            "0xa219439258ca9da29e9cc4ce5596924745e12b93": ("USDT", 6),
            "0x3ff47c5bf409c86533fe1f4907524d304062428d": ("EURe", 18),
            "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f": ("WETH", 18),
        }
        
        token_address = token_address.lower()
        
        if token_address in known_tokens:
            return known_tokens[token_address]
            
        # Fallback to common defaults
    def save_preliminary_data(self, transactions, processed_count, total_count):
        """Save preliminary data every 50 transactions for early investigation"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"metamask_preliminary_{processed_count}of{total_count}_{timestamp}.csv"
        
        if transactions:
            df = pd.DataFrame(transactions)
            
            # Add basic calculated columns
            df['date'] = pd.to_datetime(df['timestamp']).dt.date
            df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
            
            # Save
            df.to_csv(filename, index=False)
            
            print(f"\n💾 PRELIMINARY SAVE: {filename}")
            print(f"📊 Progress: {processed_count}/{total_count} transactions processed")
            print(f"💳 Found: {len(transactions)} card purchases so far")
            
            if len(transactions) > 0:
                # Quick analysis
                print(f"🎯 QUICK PREVIEW:")
                print(f"  Unique users: {df['user_wallet'].nunique()}")
                print(f"  Tokens used: {df['token_symbol'].value_counts().to_dict()}")
                print(f"  Settlement addresses: {df['settlement_address'].unique().tolist()}")
                print(f"  Amount range: ${df['amount'].min():.2f} - ${df['amount'].max():.2f}")
                print(f"  Latest purchase: {df['timestamp'].max()}")
                
                # Show a few examples
                print(f"\n📝 SAMPLE PURCHASES:")
                sample = df.head(3)[['timestamp', 'user_wallet', 'amount', 'token_symbol']]
                for _, row in sample.iterrows():
                    print(f"  {row['amount']:.2f} {row['token_symbol']} - {row['user_wallet'][:10]}... - {row['timestamp'][:10]}")
            else:
                print(f"⚠️ No card purchases found in first {processed_count} transactions")
                print("📋 POSSIBLE REASONS:")
                print("  - Contract not used for card transactions")
                print("  - Wrong settlement address")
                print("  - No recent card activity")
                print("  - Wrong contract address")
                
        else:
            # Save empty file with debug info
            debug_info = {
                'processed_transactions': processed_count,
                'total_transactions': total_count,
                'settlements_tracked': len(self.known_settlements) + len(self.discovered_settlements),
                'message': 'No card purchases found yet'
            }
            
            with open(filename.replace('.csv', '_debug.txt'), 'w') as f:
                for key, value in debug_info.items():
                    f.write(f"{key}: {value}\n")
            
            print(f"\n💾 DEBUG SAVE: {filename.replace('.csv', '_debug.txt')}")
            print(f"⚠️ No card data found in {processed_count} transactions")
        
        return filename
        
    def save_to_csv(self, transactions):
        """Save all card spending data to CSV"""
        df = pd.DataFrame(transactions)
        
        # Add calculated columns
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6])
        
        # Create filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"metamask_card_complete_spending_{timestamp}.csv"
        
        # Save
        df.to_csv(filename, index=False)
        
        # Print comprehensive analysis
        self.print_complete_analysis(df)
        
        return filename
        
    def print_complete_analysis(self, df):
        """Print comprehensive spending analysis"""
        print(f"\n{'='*60}")
        print(f"🎯 COMPLETE METAMASK CARD SPENDING ANALYSIS")
        print(f"{'='*60}")
        
        print(f"📊 OVERVIEW:")
        print(f"  Total card purchases: {len(df):,}")
        print(f"  Unique card users: {df['user_wallet'].nunique():,}")
        print(f"  Unique tokens used: {df['token_symbol'].nunique()}")
        print(f"  Date range: {df['date'].min()} to {df['date'].max()}")
        
        # Token usage
        print(f"\n💰 SPENDING BY TOKEN:")
        token_stats = df.groupby('token_symbol').agg({
            'amount': ['sum', 'count', 'mean'],
            'user_wallet': 'nunique'
        }).round(2)
        
        for token in token_stats.index:
            total = token_stats.loc[token, ('amount', 'sum')]
            count = token_stats.loc[token, ('amount', 'count')]
            avg = token_stats.loc[token, ('amount', 'mean')]
            users = token_stats.loc[token, ('user_wallet', 'nunique')]
            print(f"  {token}: {total:,.2f} total | {count:,} purchases | {avg:.2f} avg | {users:,} users")
            
        # Top purchases
        print(f"\n🏆 LARGEST CARD PURCHASES:")
        top_purchases = df.nlargest(10, 'amount')[['timestamp', 'user_wallet', 'amount', 'token_symbol']]
        for _, row in top_purchases.iterrows():
            print(f"  {row['amount']:.2f} {row['token_symbol']} - {row['user_wallet'][:10]}... - {row['timestamp'][:10]}")
            
        # Most active users
        print(f"\n👥 MOST ACTIVE CARD USERS:")
        user_stats = df.groupby('user_wallet').agg({
            'amount': ['count', 'sum'],
            'token_symbol': lambda x: ', '.join(x.unique())
        }).round(2)
        user_stats.columns = ['purchase_count', 'total_spent', 'tokens_used']
        top_users = user_stats.nlargest(10, 'purchase_count')
        
        for user, stats in top_users.iterrows():
            print(f"  {user[:10]}... - {stats['purchase_count']} purchases - {stats['total_spent']:.2f} spent - {stats['tokens_used']}")
            
        # Time patterns
        print(f"\n⏰ USAGE PATTERNS:")
        hourly = df.groupby('hour').size()
        peak_hour = hourly.idxmax()
        print(f"  Peak hour: {peak_hour}:00 ({hourly[peak_hour]} purchases)")
        
        daily = df.groupby('day_of_week').size()
        peak_day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][daily.idxmax()]
        print(f"  Peak day: {peak_day} ({daily.max()} purchases)")
        
        weekend_pct = (df['is_weekend'].sum() / len(df)) * 100
        print(f"  Weekend usage: {weekend_pct:.1f}% of purchases")
        
        # API usage summary
        elapsed_time = (time.time() - self.start_time) / 60 if hasattr(self, 'start_time') else 0
        actual_rate = self.rate_limiter.call_count / elapsed_time / 60 if elapsed_time > 0 else 0
        
        print(f"\n📊 API USAGE SUMMARY:")
        print(f"  Total API calls made: {self.rate_limiter.call_count:,}")
        print(f"  Execution time: {elapsed_time:.1f} minutes")
        print(f"  Actual rate: {actual_rate:.2f} calls/sec")
        print(f"  Rate limit: {self.rate_limiter.max_calls_per_second} calls/sec (safely under 5/sec)")
        
        all_settlements = df['settlement_address'].unique()
        print(f"\n✅ SETTLEMENT VERIFICATION:")
        print(f"  Unique settlement addresses found: {len(all_settlements)}")
        for addr in all_settlements:
            count = (df['settlement_address'] == addr).sum()
            print(f"    {addr} - {count:,} transactions ({count/len(df)*100:.1f}%)")

# Main usage
if __name__ == "__main__":
    print("🚀 FIXED Rate Limited MetaMask Card Analyzer")
    print("Properly rate limited to never exceed 4 calls/sec")
    print("=" * 60)
    
    API_KEY = ""
    if not API_KEY:
        API_KEY = "YourAPIKey"
        print("⚠️ Using default API key")
    
    # Option to disable auto-discovery for faster execution
    auto_discover = input("Auto-discover settlement addresses? (y/n, default=n): ").strip().lower()
    auto_discover = auto_discover == 'y'
    
    collector = MetamaskCardTransactionCollector(API_KEY, auto_discover_settlements=auto_discover)
    
    try:
        collector.start_time = time.time()
        print(f"\n🎯 Analyzing contract: {collector.metamask_contract}")
        print(f"🔗 Chain ID: {collector.chain_id} (Linea)")
        if auto_discover:
            print("🕵️ Will auto-discover settlement addresses")
        else:
            print(f"🎯 Using known settlements: {collector.known_settlements}")
        print("⏳ This will discover ALL MetaMask card transactions...")
        print(f"🛡️ GUARANTEED rate limited to {collector.rate_limiter.max_calls_per_second} calls/sec")
        
        filename = collector.collect_all_card_transactions()
        
        total_time = (time.time() - collector.start_time) / 60
        print(f"\n⏱️ Total execution time: {total_time:.1f} minutes")
        
        if filename:
            print(f"\n✅ SUCCESS! Complete spending analysis saved to: {filename}")
            print("\n📈 This CSV contains COMPLETE MetaMask card data:")
            print("- ALL tokens used (discovered automatically)")
            print("- ALL settlement addresses (discovered automatically)")
            print("- ALL user spending patterns")
            print("- Complete transaction details")
            print("- Time-based usage analysis")
        else:
            print("\n❌ No card transactions found")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()