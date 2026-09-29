import { Mail, Store, CreditCard, Truck, Users, Facebook, Twitter, Instagram, Linkedin, Youtube, Play, Apple } from "lucide-react";
import logo from "@/assets/camemark-logo.png";
import { Link } from "react-router-dom";

const NewFooter = () => {
  return (
    <footer className="bg-[#072516] text-white/80 text-sm">
      {/* Features Bar */}
      <div className="bg-white text-gray-800 border-t border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Store className="h-6 w-6 text-gray-700" />
              <div>
                <h4 className="font-bold text-sm">Join Thousands of Sellers</h4>
                <p className="text-xs text-gray-500">Grow your business on Banda Market</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Store className="h-6 w-6 text-gray-700" />
              <div>
                <h4 className="font-bold text-sm">Shop from Verified Stores</h4>
                <p className="text-xs text-gray-500">Trusted by millions across Africa and beyond</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <CreditCard className="h-6 w-6 text-gray-700" />
              <div>
                <h4 className="font-bold text-sm">Pay Your Way</h4>
                <p className="text-xs text-gray-500">Cards, Mobile Money & more</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Truck className="h-6 w-6 text-gray-700" />
              <div>
                <h4 className="font-bold text-sm">Delivered to Your Door</h4>
                <p className="text-xs text-gray-500">Fast, reliable delivery worldwide</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Users className="h-6 w-6 text-gray-700" />
              <div>
                <h4 className="font-bold text-sm">Be Part of a Global Community</h4>
                <p className="text-xs text-gray-500">Shop. Learn. Network. Belong.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter & App */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Mail className="h-8 w-8 text-white" />
            <div>
              <h4 className="font-bold text-white text-base">Get the Best Deals First</h4>
              <p className="text-xs">Subscribe to our newsletter and never miss a deal, new arrival or exclusive offer.</p>
            </div>
          </div>
          
          <div className="flex w-full md:w-auto max-w-md gap-2">
            <input type="email" placeholder="Enter your email address" className="px-4 py-2 rounded-lg text-gray-900 w-full md:w-64 outline-none" />
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">
              Subscribe
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div>
              <h4 className="font-bold text-white text-base">Download the Banda Market App</h4>
              <p className="text-xs">Shop anytime, anywhere. Available on iOS and Android.</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700 hover:border-gray-500">
                <Play className="h-5 w-5" />
                <div className="text-left leading-tight">
                  <div className="text-[9px]">GET IT ON</div>
                  <div className="text-xs font-bold">Google Play</div>
                </div>
              </button>
              <button className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700 hover:border-gray-500">
                <Apple className="h-5 w-5" />
                <div className="text-left leading-tight">
                  <div className="text-[9px]">Download on the</div>
                  <div className="text-xs font-bold">App Store</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative">
          
          <div className="col-span-2 lg:col-span-1">
            <img src={logo} alt="Banda Market" className="h-10 w-auto mb-2 brightness-0 invert" />
            <p className="text-xs text-white mb-4">Shop • Sell • Grow • Belong</p>
            <p className="text-xs text-white/60 mb-6">Africa to the world, the world to Africa.</p>
            <div className="flex gap-3 text-white/60">
              <a href="#" className="hover:text-white"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-amber-500 transition-colors">All Categories</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Today's Deals</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Banda Brands</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Global Store</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Sell</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Become a Seller</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Seller Center</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Seller Guidelines</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Fees & Pricing</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-amber-500">Banda Academy</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Online Courses</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">For Individuals</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">For Businesses</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Partner with Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Academy Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Help & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Customer Service</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">About Banda Market</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Our Impact</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Press & Media</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Partner with Us</a></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-white mb-4">We Accept</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-blue-900">VISA</div>
              <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-red-500">Mastercard</div>
              <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-blue-500">PayPal</div>
              <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-black">Apple Pay</div>
            </div>

            <h4 className="font-bold text-white mb-4">Mobile Money</h4>
            <div className="flex flex-wrap gap-2">
              <div className="bg-yellow-400 px-2 py-1 rounded text-[10px] font-bold text-black">MTN MoMo</div>
              <div className="bg-orange-500 px-2 py-1 rounded text-[10px] font-bold text-white">Orange</div>
              <div className="bg-blue-400 px-2 py-1 rounded text-[10px] font-bold text-white">Wave</div>
            </div>
          </div>
          
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-xs">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50">
          <p>© 2026 Banda Market. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Policy</a>
            <a href="#" className="hover:text-white">Accessibility</a>
          </div>
          <p>A Marketplace for People, Businesses and Communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
