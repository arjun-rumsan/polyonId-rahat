"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

// Beneficiary data type
type Beneficiary = {
  id: number;
  walletAddress: string;
};

// Sample initial data
const initialBeneficiaries: Beneficiary[] = [
  {
    id: 1,
    walletAddress: "0x15D7AA0B820027a82Bb228e1e9675C05B695C363",
  },
  {
    id: 2,

    walletAddress: "0x12120bda45C87FbfDF3aADF1004e318BB3D4E531",
  },
  {
    id: 3,

    walletAddress: "0x57fC5424225F00c1f5f1431dF6c7c6e1829A1660",
  },
  {
    id: 4,
    walletAddress: "0x841Ecb0a96A18f16C6eE9b895ABC290F462Cc527",
  },
];

interface BeneficiaryFilters {
  name: string;
  age: string;
  gender: string;
}
const fetchBeneficiariesList = async (filters?: BeneficiaryFilters) => {
  try {
    // Construct query parameters from filters
    const params = {
      ...(filters?.name && { name: filters.name }),
      ...(filters?.age && { age: filters.age }),
      ...(filters?.gender && { gender: filters.gender }),
    };

    // Make the API call
    const response = await axios.get<Beneficiary[]>("/api/mass-payout", {
      params, // Add query parameters
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers if required
        // 'Authorization': `Bearer ${token}`
      },
      // Optional timeout to prevent long-running requests
      timeout: 10000, // 10 seconds
    });

    // Return the data
    return response.data;
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      // Axios-specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(
          `API error: ${
            error.response.data.message || "Failed to fetch beneficiaries"
          }`
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error("Error setting up the request");
      }
    } else {
      // Handle non-Axios errors
      throw new Error("An unexpected error occurred");
    }
  }
};
const BeneficiariesCard = () => {
  const [filters, setFilters] = useState({
    name: "",
    age: "",
    gender: "",
  });

  const { toast } = useToast();

  type FormData = {
    amountToDisperse: number;
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      amountToDisperse: 0.0002,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/mass-payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amountToDisperse: data.amountToDisperse }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payout successfully initiated!",
        });
        reset(); // Reset the form fields
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed",
          description: errorData.data || "Unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed",
        description: errorData.data || "Unknown error occurred.",
        variant: "destructive",
      });
    }
  };
  const [amountToDisperse, setAmountToDisperse] = useState(0.002);

  useQuery({ queryKey: ["todos"], queryFn: fetchBeneficiariesList });
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Beneficiaries Wallet Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtering Inputs */}
        <div className="flex items-center py-4 space-x-4">
          {/* Name Filter */}
          <Input
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
            className="max-w-sm"
          />

          {/* Age Filter */}
          <Input
            placeholder="Filter by age..."
            value={filters.age}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, age: e.target.value }))
            }
            className="max-w-sm"
          />

          {/* Gender Filter */}
          <Select
            value={filters.gender || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                gender: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Beneficiary List */}
        <div className="space-y-4">
          {initialBeneficiaries.map((beneficiary) => (
            <div
              key={beneficiary.id}
              className="border p-4 rounded-md shadow-sm bg-gray-50"
            >
              <p className="text-gray-500">
                Wallet: {beneficiary.walletAddress}
              </p>
            </div>
          ))}

          {/* No Results */}
          {initialBeneficiaries.length === 0 && (
            <p className="text-center text-gray-500">No beneficiaries found.</p>
          )}
        </div>
        <br />
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-2">
          <div className="flex flex-col max-w-sm">
            <Input
              {...register("amountToDisperse", {
                required: "Amount is required",
                min: {
                  value: 0.00001,
                  message: "Amount must be at least 0.00001 ETH",
                },
              })}
              placeholder="Enter amount to disperse in ETH"
              className="max-w-sm"
              type="number"
              step="0.00001" // Ensure step matches ETH precision
            />
            {errors.amountToDisperse && (
              <span className="text-red-500 text-sm">
                {errors.amountToDisperse.message}
              </span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Send Mass-Payout"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BeneficiariesCard;
