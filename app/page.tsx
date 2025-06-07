"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Film,
  Play,
  Wallet,
  User,
  Calendar,
  Clock,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  Lock,
  LogOut,
  Home,
  Ticket,
  Settings,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Movie {
  _id: string
  title: string
  poster: string
  genre: string
  year: number
  duration: number
  rating: number
  price: number
  description: string
  director: string
  cast: string[]
  releaseDate: string
}

interface ApiResponse {
  movies: Movie[]
  meta: {
    source: "api" | "mock" | "fallback"
    timestamp: string
    total: number
    error?: string
  }
}

interface TransactionStatus {
  status: 'pending' | 'success' | 'error' | null;
  hash: string | null;
  message: string | null;
  rentalEndTime?: number | null;
}

interface RentalInfo {
  movieId: string;
  endTime: number;
  transactionHash: string;
  movie?: {
    title: string;
    poster: string;
    price: number;
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [currentDateTime, setCurrentDateTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")
  const [dataSource, setDataSource] = useState<"api" | "mock" | "fallback">("mock")
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: null,
    hash: null,
    message: null
  });
  const [isRenting, setIsRenting] = useState(false);
  const [rentals, setRentals] = useState<RentalInfo[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'error' }[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [showStaffMenu, setShowStaffMenu] = useState(false)
  const router = useRouter()

  const moviesPerPage = 8

  // Check for existing user session on load
  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Error parsing stored user:", e)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    fetchMovies()

    // Update time display
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDateTime(now.toLocaleTimeString())
      setCurrentDate(now.toLocaleDateString())
    }
    updateDateTime() // Initial update
    const timer = setInterval(updateDateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    console.log('Filtering with:', { searchTerm, selectedMonth, selectedYear });
    filterMovies();
  }, [movies, searchTerm, selectedMonth, selectedYear]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log("Fetching movies...");

      const response = await fetch("/api/movies");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("Received movie data:", {
        totalMovies: Array.isArray(data) ? data.length : data.movies?.length,
        source: Array.isArray(data) ? "direct" : data.meta?.source,
        hasMovies: Array.isArray(data) ? data.length > 0 : data.movies?.length > 0
      });

      // Handle both old format (direct array) and new format (with meta)
      if (Array.isArray(data)) {
        // Old format - direct array
        setMovies(data);
        setDataSource("mock");
        console.log("Using direct array format, movies count:", data.length);
      } else {
        // New format - with metadata
        setMovies(data.movies || []);
        setDataSource(data.meta?.source || "mock");
        console.log("Using metadata format, movies count:", data.movies?.length);
      }

      // Log the first few movies to verify data
      const moviesToLog = Array.isArray(data) ? data.slice(0, 3) : data.movies?.slice(0, 3);
      console.log("Sample movies:", moviesToLog?.map(m => ({
        title: m.title,
        releaseDate: m.releaseDate,
        month: new Date(m.releaseDate).getMonth() + 1,
        year: new Date(m.releaseDate).getFullYear()
      })));

      setFilteredMovies(Array.isArray(data) ? data : data.movies || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      setDataSource("fallback");
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    if (!movies.length) {
      console.log('No movies available to filter');
      return;
    }

    console.log('Starting filter with:', {
      totalMovies: movies.length,
      searchTerm,
      selectedMonth,
      selectedYear
    });

    let filtered = [...movies];

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchLower) ||
          movie.genre.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', filtered.length, 'movies');
    }

    // Month filter
    if (selectedMonth) {
      filtered = filtered.filter((movie) => {
        try {
          const releaseDate = new Date(movie.releaseDate);
          const releaseMonth = releaseDate.getMonth() + 1; // getMonth() returns 0-11
          const monthMatch = releaseMonth.toString() === selectedMonth;
          console.log(`Movie: ${movie.title}, Release Date: ${movie.releaseDate}, Month: ${releaseMonth}, Selected: ${selectedMonth}, Match: ${monthMatch}`);
          return monthMatch;
        } catch (error) {
          console.error(`Error filtering movie ${movie.title} by month:`, error);
          return false;
        }
      });
      console.log('After month filter:', filtered.length, 'movies');
    }

    // Year filter
    if (selectedYear) {
      filtered = filtered.filter((movie) => {
        try {
          const releaseDate = new Date(movie.releaseDate);
          const releaseYear = releaseDate.getFullYear();
          const yearMatch = releaseYear.toString() === selectedYear;
          console.log(`Movie: ${movie.title}, Release Date: ${movie.releaseDate}, Year: ${releaseYear}, Selected: ${selectedYear}, Match: ${yearMatch}`);
          return yearMatch;
        } catch (error) {
          console.error(`Error filtering movie ${movie.title} by year:`, error);
          return false;
        }
      });
      console.log('After year filter:', filtered.length, 'movies');
    }

    console.log('Final filtered movies:', filtered.map(m => ({
      title: m.title,
      date: m.releaseDate,
      month: new Date(m.releaseDate).getMonth() + 1,
      year: new Date(m.releaseDate).getFullYear()
    })));

    setFilteredMovies(filtered);
  };

  const handleLogin = async (credentials: any) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Login failed: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Login failed")
      }

      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        setLoginOpen(false)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      alert(error.message || "Login failed. Please check your credentials and try again.")
    }
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Ethereum wallet to connect")
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const address = accounts[0]

      // Connect to the wallet
      await handleLogin({
        username: address,
        password: address, // Using address as password for wallet login
        type: "wallet"
      })

      setWalletConnected(true)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  const disconnectWallet = () => {
    setWalletConnected(false)
    logout()
  }

  const trackTransaction = async (txHash: string) => {
    try {
      if (!window.ethereum) return;

      // Wait for transaction to be mined
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (receipt) {
        if (receipt.status === '0x1') {
          setTransactionStatus({
            status: 'success',
            hash: txHash,
            message: 'Transaction confirmed!'
          });
    } else {
          setTransactionStatus({
            status: 'error',
            hash: txHash,
            message: 'Transaction failed'
          });
        }
      } else {
        // If not mined yet, check again in 2 seconds
        setTimeout(() => trackTransaction(txHash), 2000);
      }
    } catch (error) {
      console.error('Error tracking transaction:', error);
      setTransactionStatus({
        status: 'error',
        hash: txHash,
        message: 'Error tracking transaction'
      });
    }
  };

  const handleRentMovie = async (movieId: string, price: number) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    if (!user.wallet) {
      alert("Please connect your wallet to rent movies");
      return;
    }

    // Set initial transaction status
    setTransactionStatus({
      status: 'pending',
      hash: null,
      message: 'Preparing transaction...'
    });

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet");
      }

      // Convert price to Wei and format as hex
      const priceInWei = BigInt(Math.floor(price * 1e18)).toString(16);
      
      // Use the actual contract address from your deployed contract
      const contractAddress = "0x1234567890123456789012345678901234567890"; // Replace with your actual contract address
      
      // Validate addresses
      const validateAddress = (address: string | undefined, name: string) => {
        if (!address) {
          throw new Error(`No ${name} provided`);
        }
        if (!address.startsWith('0x')) {
          throw new Error(`Invalid ${name} format: must start with 0x`);
        }
        if (address.length !== 42) {
          throw new Error(`Invalid ${name} format: must be 42 characters (including 0x)`);
        }
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
          throw new Error(`Invalid ${name} format: must be a valid Ethereum address`);
        }
      };

      validateAddress(contractAddress, 'contract address');
      validateAddress(user.wallet, 'user address');

      // Get current network chainId
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current chain ID:", chainId);

      // Get current gas price
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice'
      });
      console.log("Current gas price:", gasPrice);

      // Get current nonce
      const nonce = await window.ethereum.request({
        method: 'eth_getTransactionCount',
        params: [user.wallet, 'latest']
      });
      console.log("Current nonce:", nonce);

      // Get account balance and verify sufficient funds
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [user.wallet, 'latest']
      });
      console.log("Account balance:", balance);

      // Verify sufficient balance
      if (BigInt(balance) < BigInt(`0x${priceInWei}`)) {
        throw new Error("Insufficient balance to rent this movie");
      }

      const transactionParameters = {
        to: contractAddress,
        from: user.wallet,
        value: `0x${priceInWei}`,
        gasPrice: gasPrice,
        chainId: chainId,
        nonce: nonce,
        // Add data field for the rentMovie function call
        data: "0x" + // Function selector for rentMovie(string)
          "0000000000000000000000000000000000000000000000000000000000000020" + // Offset for string parameter
          "000000000000000000000000000000000000000000000000000000000000000" + // Length of movieId
          movieId.padStart(64, '0') // MovieId parameter
      };

      // Log transaction parameters
      console.log("Transaction parameters:", transactionParameters);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      if (!txHash) {
        throw new Error("Transaction failed - no transaction hash received");
      }

      // Update status before sending transaction
      setTransactionStatus(prev => ({
        ...prev,
        message: 'Waiting for wallet confirmation...'
      }));

      // Start tracking the transaction
      trackTransaction(txHash);

      // Wait for transaction confirmation
      const token = localStorage.getItem("token");
      let response;
      try {
        response = await fetch("/api/rent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ 
            movieId, 
            price,
            transactionHash: txHash,
            walletAddress: user.wallet
          }),
        });
      } catch (fetchError) {
        console.error("API request error:", fetchError);
        throw new Error("Failed to communicate with the server");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      
      // After successful transaction
      const rentalEndTime = Date.now() + (48 * 60 * 60 * 1000); // 48 hours from now
      
      // Add to rentals
      setRentals(prev => [...prev, {
        movieId,
        endTime: rentalEndTime,
        transactionHash: txHash,
        movie: movies.find(m => m._id === movieId)
      }]);

      // Store rental info in localStorage
      const storedRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
      localStorage.setItem('rentals', JSON.stringify([...storedRentals, {
        movieId,
        endTime: rentalEndTime,
        transactionHash: txHash,
        movie: movies.find(m => m._id === movieId)
      }]));

      // Update status after successful transaction
      setTransactionStatus({
        status: 'success',
        hash: txHash,
        message: 'Movie rented successfully! You can now watch it for 48 hours.',
        rentalEndTime
      });

    } catch (error: any) {
      // Enhanced error logging
      console.error("Rental error details:", {
        error,
        type: typeof error,
        isError: error instanceof Error,
        message: error instanceof Error ? error.message : String(error),
        code: error?.code,
        data: error?.data,
        stack: error instanceof Error ? error.stack : undefined,
        metamaskError: error?.error?.message || error?.error?.code,
        transactionError: error?.transactionError,
        reason: error?.reason,
        name: error?.name,
        details: error?.details,
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });

      let errorMessage = "Failed to rent movie";
      
      // Handle MetaMask specific errors
      if (error?.code) {
        switch (error.code) {
          case 4001:
            errorMessage = "Transaction was rejected by user";
            break;
          case -32603:
            errorMessage = "Transaction failed: " + (error.data?.message || error.message || "Unknown error");
            break;
          case -32002:
            errorMessage = "Transaction already pending. Please check your wallet";
            break;
          case -32602:
            errorMessage = "Invalid transaction parameters. Please try again";
            break;
          case -32005:
            errorMessage = "Request limit exceeded. Please try again later";
            break;
          default:
            errorMessage = `Transaction failed (${error.code}): ${error.message || "Unknown error"}`;
        }
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = 
          error?.data?.message || 
          error?.error?.message || 
          error?.transactionError?.message ||
          error?.reason ||
          JSON.stringify(error);
      }

      setTransactionStatus({
        status: 'error',
        hash: null,
        message: errorMessage
      });

      // Show error notification
      addNotification(errorMessage, 'error');
    } finally {
      setIsRenting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setWalletConnected(false)
  }

  const paginatedMovies = filteredMovies.slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage)

  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage)

  // Get status info based on data source
  const getStatusInfo = () => {
    switch (dataSource) {
      case "api":
        return {
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Live Mode - Connected to API",
          color: "text-green-400 border-green-400",
        }
      case "mock":
        return {
          icon: <Wifi className="h-3 w-3 mr-1" />,
          text: "Demo Mode - Using sample data",
          color: "text-yellow-400 border-yellow-400",
        }
      case "fallback":
        return {
          icon: <WifiOff className="h-3 w-3 mr-1" />,
          text: "Offline Mode - Limited functionality",
          color: "text-red-400 border-red-400",
        }
      default:
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: "Loading...",
          color: "text-gray-400 border-gray-400",
        }
    }
  }

  const statusInfo = getStatusInfo()

  // Add function to get Etherscan URL
  const getEtherscanUrl = (hash: string) => {
    return `https://etherscan.io/tx/${hash}`;
  };

  // Add function to format time remaining
  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) return "Expired";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Add function to update rental timers
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining: Record<string, string> = {};
      rentals.forEach(rental => {
        newTimeRemaining[rental.movieId] = formatTimeRemaining(rental.endTime);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [rentals]);

  // Load rentals from localStorage on component mount
  useEffect(() => {
    const storedRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
    setRentals(storedRentals);
  }, []);

  // Add notification function
  const addNotification = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Check for expiring rentals
  useEffect(() => {
    const checkExpiringRentals = () => {
      rentals.forEach(rental => {
        const timeLeft = rental.endTime - Date.now();
        if (timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000) { // Less than 24 hours
          addNotification(
            `Your rental of ${rental.movie?.title} will expire in ${formatTimeRemaining(rental.endTime)}`,
            'warning'
          );
        }
      });
    };

    const interval = setInterval(checkExpiringRentals, 60 * 60 * 1000); // Check every hour
    checkExpiringRentals(); // Initial check

    return () => clearInterval(interval);
  }, [rentals]);

  // Update TransactionDialog component
  const TransactionDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (transactionStatus.status !== null) {
        setIsOpen(true);
      }
    }, [transactionStatus.status]);

    const handleClose = () => {
      if (transactionStatus.status === 'success' || transactionStatus.status === 'error') {
        setTransactionStatus({ status: null, hash: null, message: null });
        setIsOpen(false);
      }
    };

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {transactionStatus.status === 'pending' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
                <div className="text-center">
                  <p className="font-medium">Processing Transaction</p>
                  <p className="text-sm text-gray-500 mt-1">{transactionStatus.message}</p>
                </div>
              </div>
            )}
            {transactionStatus.status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-500">Transaction Successful!</p>
                  {transactionStatus.rentalEndTime && (
                    <p className="text-sm text-gray-500 mt-1">
                      Rental expires in: {formatTimeRemaining(transactionStatus.rentalEndTime)}
                    </p>
                  )}
                </div>
              </div>
            )}
            {transactionStatus.status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-red-500">Transaction Failed</p>
                  <p className="text-sm text-gray-500 mt-1">{transactionStatus.message}</p>
                </div>
              </div>
            )}
            {transactionStatus.hash && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500 break-all">
                  Transaction Hash: {transactionStatus.hash}
                </div>
                <a
                  href={getEtherscanUrl(transactionStatus.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center justify-center space-x-1"
                >
                  <span>View on Etherscan</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            {(transactionStatus.status === 'success' || transactionStatus.status === 'error') && (
              <Button
                onClick={handleClose}
                className="w-full"
                variant={transactionStatus.status === 'success' ? 'default' : 'destructive'}
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Update movie card to show rental status
  const renderMovieCard = (movie: Movie) => {
    const rental = rentals.find(r => r.movieId === movie._id);
    const isRented = rental && Date.now() < rental.endTime;

    return (
      <Card key={movie._id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
        <CardHeader className="p-0">
          <div className="relative">
            <Image
              src={movie.poster || "/placeholder.svg?height=400&width=300"}
              alt={movie.title}
              width={300}
              height={400}
              className="w-full h-64 object-cover rounded-t-lg"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=300"
              }}
            />
            <Badge className="absolute top-2 right-2 bg-purple-600">{movie.rating}/10</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-white mb-2">{movie.title}</CardTitle>
          <CardDescription className="text-gray-300 mb-4">
            {movie.genre} • {movie.year} • {movie.duration}min
          </CardDescription>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-400">
              {movie.price ? `${movie.price.toFixed(3)} ETH` : '0.000 ETH'}
            </span>
            <div className="space-x-2">
              <Link href={`/movie/${movie._id}`}>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </Link>
              {isRented ? (
            <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Rented
              </Badge>
                  <span className="text-sm text-gray-400">
                    {timeRemaining[movie._id]}
                  </span>
            </div>
              ) : (
                <Button
                  onClick={() => handleRentMovie(movie._id, movie.price)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isRenting}
                >
                  {isRenting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3 w-3" />
                      Rent
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add a function to refresh movies
  const refreshMovies = async () => {
    try {
      setLoading(true);
      console.log("Refreshing movies...");
      await fetchMovies();
      addNotification("Movie list refreshed successfully", "info");
    } catch (error) {
      console.error("Error refreshing movies:", error);
      addNotification("Failed to refresh movie list", "error");
    }
  };

  // Modify the Add Film button to include refresh functionality
  const handleAddFilm = () => {
    router.push("/add-film");
    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "newFilmAdded") {
        refreshMovies();
        window.removeEventListener("storage", handleStorageChange);
      }
    };
    window.addEventListener("storage", handleStorageChange);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30'
                : notification.type === 'warning'
                ? 'bg-yellow-500/20 border border-yellow-500/30'
                : 'bg-blue-500/20 border border-blue-500/30'
            }`}
          >
            <p className="text-white">{notification.message}</p>
                </div>
        ))}
              </div>

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">CinemaVault</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Welcome Message */}
              {user && (
                <span className="text-white">
                  Welcome, {user.type === "staff" ? `Staff (${user.username})` : "Customer"}
                </span>
              )}

              {/* Staff Profile Button */}
              {user?.type === "staff" && (
                <>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={handleAddFilm}
                  >
                    <Film className="h-5 w-5 mr-2" />
                          Add Film
                        </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setShowStaffMenu(!showStaffMenu)}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Staff Profile
                      <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    
                    {/* Staff Dropdown Menu */}
                    {showStaffMenu && (
                      <Card className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border-white/20">
                        <CardContent className="p-2 space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/20"
                            onClick={() => {
                              router.push("/change-password")
                              setShowStaffMenu(false)
                            }}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/20"
                            onClick={() => {
                              router.push("/dashboard")
                              setShowStaffMenu(false)
                            }}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/20"
                            onClick={() => {
                              router.push("/tickets")
                              setShowStaffMenu(false)
                            }}
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            Manage Tickets
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-white/20"
                            onClick={() => {
                              router.push("/settings")
                              setShowStaffMenu(false)
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <div className="border-t border-white/10 my-1"></div>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:bg-red-500/20"
                            onClick={() => {
                              logout()
                              setShowStaffMenu(false)
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                        </CardContent>
                      </Card>
                    )}
                </div>
                </>
              )}

              {/* Existing Wallet/Login Button */}
              {!user ? (
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <User className="h-5 w-5 mr-2" />
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Login to CinemaVault</DialogTitle>
                      <DialogDescription>Choose your login method</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="wallet">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="wallet">Wallet Login</TabsTrigger>
                        <TabsTrigger value="staff">Staff Login</TabsTrigger>
                      </TabsList>
                      <TabsContent value="wallet" className="space-y-4">
                        <Button onClick={connectWallet} className="w-full">
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </Button>
                      </TabsContent>
                      <TabsContent value="staff" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" placeholder="Enter staff username" defaultValue="s235776767" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" placeholder="Enter password" defaultValue="1234567890" />
                        </div>
                        <Button
                          onClick={() => handleLogin({ username: "s235776767", password: "1234567890", type: "staff" })}
                          className="w-full"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Staff Login
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  {/* Rental History Link for Customers */}
                  {user.type === "customer" && (
                    <Link href="/rental-history">
                      <Button variant="ghost" className="text-white hover:bg-white/20">
                        <Ticket className="h-4 w-4 mr-2" />
                        Rental History
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </>
              )}

              {/* Existing Wallet Button */}
              {!walletConnected ? (
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={connectWallet}
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={disconnectWallet}
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div
        className={`${dataSource === "api" ? "bg-green-600/20 border-green-400/30" : dataSource === "mock" ? "bg-yellow-600/20 border-yellow-400/30" : "bg-red-600/20 border-red-400/30"} border-b`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div
              className={`flex items-center ${dataSource === "api" ? "text-green-200" : dataSource === "mock" ? "text-yellow-200" : "text-red-200"}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search movies by title or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-white" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-white" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 20 }, (_, i) => {
                    const year = 2017 - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-white">Loading movies...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedMovies.length > 0 ? (
                paginatedMovies.map(renderMovieCard)
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-white text-xl">No movies found matching your search criteria</div>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedMonth("")
                      setSelectedYear("")
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>
                
                {/* First page */}
                  <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(1)}
                  size="sm"
                >
                  1
                  </Button>

                {/* Left ellipsis */}
                {currentPage > 3 && (
                  <span className="px-2 text-gray-400">...</span>
                )}

                {/* Pages around current page */}
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber !== 1 &&
                    pageNumber !== totalPages &&
                    Math.abs(pageNumber - currentPage) <= 1
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNumber)}
                        size="sm"
                      >
                        {pageNumber}
                      </Button>
                    );
                  }
                  return null;
                })}

                {/* Right ellipsis */}
                {currentPage < totalPages - 2 && (
                  <span className="px-2 text-gray-400">...</span>
                )}

                {/* Last page */}
                {totalPages > 1 && (
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    onClick={() => setCurrentPage(totalPages)}
                    size="sm"
                  >
                    {totalPages}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Film className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">CinemaVault</h3>
              </div>
              <p className="text-gray-300">Your premium destination for blockchain-powered movie rentals.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-purple-400">
                    Browse Movies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400">
                    New Releases
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400">
                    Top Rated
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-purple-400">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <p className="text-gray-300">Built with Web3 technology for secure, decentralized movie streaming.</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 CinemaVault. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add Transaction Dialog */}
      <TransactionDialog />
    </div>
  )
}
