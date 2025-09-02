"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, IndianRupee, Calendar, Gauge, Fuel, Settings2, Eye, Heart, GitCompareArrows } from "lucide-react";

export default function ThreeDCardDemo() {
  const demoVehicles = [
    {
      id: "1",
      make: "BMW",
      model: "X5",
      year: "2022",
      asking_price: 850000,
      kilometers: 25000,
      fuel_type: "petrol",
      transmission: "automatic",
      status: "live",
      images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop"]
    },
    {
      id: "2", 
      make: "Mercedes",
      model: "C-Class",
      year: "2021",
      asking_price: 650000,
      kilometers: 35000,
      fuel_type: "diesel",
      transmission: "automatic",
      status: "live",
      images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop"]
    },
    {
      id: "3",
      make: "Audi",
      model: "A4",
      year: "2023",
      asking_price: 750000,
      kilometers: 15000,
      fuel_type: "petrol",
      transmission: "automatic",
      status: "live",
      images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop"]
    }
  ];

  const formatPrice = (price) => {
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            3D Vehicle Cards Demo
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experience the future of vehicle browsing with our interactive 3D cards. 
            Hover over the cards to see the magic happen!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoVehicles.map((vehicle) => (
            <CardContainer key={vehicle.id} className="w-full h-full">
              <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl border hover:shadow-xl transition-all duration-300 flex flex-col">
                {/* Status Badge */}
                <CardItem translateZ="30" className="absolute top-3 right-3 z-10">
                  <Badge className="bg-green-100 text-green-700">
                    {vehicle.status.toUpperCase()}
                  </Badge>
                </CardItem>

                {/* Vehicle Image */}
                <CardItem translateZ="50" className="w-full">
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden rounded-t-xl">
                    <img 
                      src={vehicle.images[0]} 
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardItem>

                {/* Action buttons */}
                <CardItem translateZ="70" className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <GitCompareArrows className="w-4 h-4" />
                  </Button>
                </CardItem>

                {/* Vehicle Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <CardItem translateZ="40" className="space-y-1">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover/card:text-blue-600 transition-colors">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-slate-600">{vehicle.year}</p>
                  </CardItem>

                  <CardItem translateZ="45" className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{vehicle.kilometers?.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      <span>{vehicle.year}</span>
                    </div>
                  </CardItem>

                  <CardItem translateZ="50" className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>{vehicle.fuel_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings2 className="w-4 h-4" />
                      <span>{vehicle.transmission}</span>
                    </div>
                  </CardItem>

                  <CardItem translateZ="55" className="flex items-center justify-between">
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {formatPrice(vehicle.asking_price)}
                    </div>
                  </CardItem>

                  {/* Action Buttons */}
                  <CardItem translateZ="60" className="flex gap-2 pt-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 flex items-center gap-1"
                    >
                      Make Offer
                    </Button>
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              How to Use 3D Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p>Hover over any card to activate 3D effects</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <p>Move your mouse to control the 3D rotation</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <p>Watch elements float and respond to your movement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
