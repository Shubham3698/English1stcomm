import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, 
  Loader2, 
  XCircle, 
  Star, 
  Zap, 
  Languages, 
  Search, 
  Trophy, 
  Flame 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const vocabList =[
  {
    "Column1": "A"
  },
  {
    "Column1": "Appendix"
  },
  {
    "Column1": "Appetite"
  },
  {
    "Column1": "Applaud"
  },
  {
    "Column1": "Apple of the eye"
  },
  {
    "Column1": "Appliance"
  },
  {
    "Column1": "Applicable"
  },
  {
    "Column1": "Application"
  },
  {
    "Column1": "Appoint"
  },
  {
    "Column1": "Appreciate"
  },
  {
    "Column1": "Apprehend"
  },
  {
    "Column1": "Approach"
  },
  {
    "Column1": "Appropriate"
  },
  {
    "Column1": "Approval"
  },
  {
    "Column1": "Approximate"
  },
  {
    "Column1": "Apt"
  },
  {
    "Column1": "Aqua"
  },
  {
    "Column1": "Architect"
  },
  {
    "Column1": "Ardent"
  },
  {
    "Column1": "Assiduous"
  },
  {
    "Column1": "Abrasive"
  },
  {
    "Column1": "Abundant"
  },
  {
    "Column1": "Acclimate"
  },
  {
    "Column1": "Acme"
  },
  {
    "Column1": "Admonish"
  },
  {
    "Column1": "Ability"
  },
  {
    "Column1": "Abandon"
  },
  {
    "Column1": "Abandonment"
  },
  {
    "Column1": "Abbreviation"
  },
  {
    "Column1": "Abide"
  },
  {
    "Column1": "Ability"
  },
  {
    "Column1": "Absence"
  },
  {
    "Column1": "Absent"
  },
  {
    "Column1": "Absolute"
  },
  {
    "Column1": "Absorb"
  },
  {
    "Column1": "Abuse"
  },
  {
    "Column1": "Accept"
  },
  {
    "Column1": "Access"
  },
  {
    "Column1": "Accident"
  },
  {
    "Column1": "Accomplish"
  },
  {
    "Column1": "According"
  },
  {
    "Column1": "Account"
  },
  {
    "Column1": "Accurate"
  },
  {
    "Column1": "Achieve"
  },
  {
    "Column1": "Acknowledge"
  },
  {
    "Column1": "Acquire"
  },
  {
    "Column1": "Active"
  },
  {
    "Column1": "Activity"
  },
  {
    "Column1": "Actual"
  },
  {
    "Column1": "Adapt"
  },
  {
    "Column1": "Add"
  },
  {
    "Column1": "Address"
  },
  {
    "Column1": "Adjust"
  },
  {
    "Column1": "Admire"
  },
  {
    "Column1": "Admission"
  },
  {
    "Column1": "Admit"
  },
  {
    "Column1": "Adopt"
  },
  {
    "Column1": "Adult"
  },
  {
    "Column1": "Advance"
  },
  {
    "Column1": "Advantage"
  },
  {
    "Column1": "Adventure"
  },
  {
    "Column1": "Advertise"
  },
  {
    "Column1": "Advice"
  },
  {
    "Column1": "Advise"
  },
  {
    "Column1": "Affair"
  },
  {
    "Column1": "Affect"
  },
  {
    "Column1": "Affection"
  },
  {
    "Column1": "Afford"
  },
  {
    "Column1": "Afraid"
  },
  {
    "Column1": "After"
  },
  {
    "Column1": "Afternoon"
  },
  {
    "Column1": "Again"
  },
  {
    "Column1": "Against"
  },
  {
    "Column1": "Age"
  },
  {
    "Column1": "Agency"
  },
  {
    "Column1": "Agent"
  },
  {
    "Column1": "Agree"
  },
  {
    "Column1": "Agreement"
  },
  {
    "Column1": "Ahead"
  },
  {
    "Column1": "Aid"
  },
  {
    "Column1": "Aim"
  },
  {
    "Column1": "Air"
  },
  {
    "Column1": "Aircraft"
  },
  {
    "Column1": "Alarm"
  },
  {
    "Column1": "Alcohol"
  },
  {
    "Column1": "Alert"
  },
  {
    "Column1": "Alien"
  },
  {
    "Column1": "Alive"
  },
  {
    "Column1": "All"
  },
  {
    "Column1": "Allow"
  },
  {
    "Column1": "Almost"
  },
  {
    "Column1": "Alone"
  },
  {
    "Column1": "Along"
  },
  {
    "Column1": "Already"
  },
  {
    "Column1": "Also"
  },
  {
    "Column1": "Alter"
  },
  {
    "Column1": "Alternative"
  },
  {
    "Column1": "Although"
  },
  {
    "Column1": "Always"
  },
  {
    "Column1": "Amazing"
  },
  {
    "Column1": "Ambition"
  },
  {
    "Column1": "Among"
  },
  {
    "Column1": "Amount"
  },
  {
    "Column1": "Amuse"
  },
  {
    "Column1": "Analysis"
  },
  {
    "Column1": "Ancient"
  },
  {
    "Column1": "Angle"
  },
  {
    "Column1": "Angry"
  },
  {
    "Column1": "Animal"
  },
  {
    "Column1": "Annual"
  },
  {
    "Column1": "Answer"
  },
  {
    "Column1": "Anxiety"
  },
  {
    "Column1": "Any"
  },
  {
    "Column1": "Apart"
  },
  {
    "Column1": "Apartment"
  },
  {
    "Column1": "Apologize"
  },
  {
    "Column1": "Apparent"
  },
  {
    "Column1": "Appeal"
  },
  {
    "Column1": "Appear"
  },
  {
    "Column1": "Appearance"
  },
  {
    "Column1": "Apple"
  },
  {
    "Column1": "Apply"
  },
  {
    "Column1": "Appoint"
  },
  {
    "Column1": "Appointment"
  },
  {
    "Column1": "Appreciate"
  },
  {
    "Column1": "Approach"
  },
  {
    "Column1": "Appropriate"
  },
  {
    "Column1": "Approval"
  },
  {
    "Column1": "Approve"
  },
  {
    "Column1": "April"
  },
  {
    "Column1": "Area"
  },
  {
    "Column1": "Argue"
  },
  {
    "Column1": "Argument"
  },
  {
    "Column1": "Arise"
  },
  {
    "Column1": "Arm"
  },
  {
    "Column1": "Army"
  },
  {
    "Column1": "Around"
  },
  {
    "Column1": "Arrange"
  },
  {
    "Column1": "Arrangement"
  },
  {
    "Column1": "Arrest"
  },
  {
    "Column1": "Arrival"
  },
  {
    "Column1": "Arrive"
  },
  {
    "Column1": "Art"
  },
  {
    "Column1": "Article"
  },
  {
    "Column1": "Artificial"
  },
  {
    "Column1": "Artist"
  },
  {
    "Column1": "As"
  },
  {
    "Column1": "Ash"
  },
  {
    "Column1": "Ask"
  },
  {
    "Column1": "Asleep"
  },
  {
    "Column1": "Aspect"
  },
  {
    "Column1": "Assemble"
  },
  {
    "Column1": "Assembly"
  },
  {
    "Column1": "Assess"
  },
  {
    "Column1": "Assessment"
  },
  {
    "Column1": "Assist"
  },
  {
    "Column1": "Assistance"
  },
  {
    "Column1": "Assistant"
  },
  {
    "Column1": "Associate"
  },
  {
    "Column1": "Association"
  },
  {
    "Column1": "Assume"
  },
  {
    "Column1": "Assure"
  },
  {
    "Column1": "Astonish"
  },
  {
    "Column1": "Atmosphere"
  },
  {
    "Column1": "Attach"
  },
  {
    "Column1": "Attack"
  },
  {
    "Column1": "Attempt"
  },
  {
    "Column1": "Attend"
  },
  {
    "Column1": "Attention"
  },
  {
    "Column1": "Attitude"
  },
  {
    "Column1": "Attorney"
  },
  {
    "Column1": "Attract"
  },
  {
    "Column1": "Attraction"
  },
  {
    "Column1": "Attribute"
  },
  {
    "Column1": "Auction"
  },
  {
    "Column1": "Audience"
  },
  {
    "Column1": "August"
  },
  {
    "Column1": "Aunt"
  },
  {
    "Column1": "Author"
  },
  {
    "Column1": "Authority"
  },
  {
    "Column1": "Automatic"
  },
  {
    "Column1": "Available"
  },
  {
    "Column1": "Average"
  },
  {
    "Column1": "Avoid"
  },
  {
    "Column1": "Awake"
  },
  {
    "Column1": "Award"
  },
  {
    "Column1": "Aware"
  },
  {
    "Column1": "Awareness"
  },
  {
    "Column1": "Away"
  },
  {
    "Column1": "About"
  },
  {
    "Column1": "Absurd"
  },
  {
    "Column1": "abuse"
  },
  {
    "Column1": "After"
  },
  {
    "Column1": "Airport"
  },
  {
    "Column1": "Anticipate"
  },
  {
    "Column1": "Awkward"
  },
  {
    "Column1": "B"
  },
  {
    "Column1": "Bold"
  },
  {
    "Column1": "Bomb"
  },
  {
    "Column1": "Bombastic"
  },
  {
    "Column1": "Bonafide"
  },
  {
    "Column1": "Bond"
  },
  {
    "Column1": "Bondage"
  },
  {
    "Column1": "Bone"
  },
  {
    "Column1": "Bony"
  },
  {
    "Column1": "Bonus"
  },
  {
    "Column1": "Bookish"
  },
  {
    "Column1": "Book-maker"
  },
  {
    "Column1": "Boom"
  },
  {
    "Column1": "Boon"
  },
  {
    "Column1": "Booth"
  },
  {
    "Column1": "Border"
  },
  {
    "Column1": "Bore"
  },
  {
    "Column1": "Borrow"
  },
  {
    "Column1": "Bosom-friend"
  },
  {
    "Column1": "Billow"
  },
  {
    "Column1": "Berserk"
  },
  {
    "Column1": "Bevy"
  },
  {
    "Column1": "Brusque"
  },
  {
    "Column1": "Buccaneer"
  },
  {
    "Column1": "Baby"
  },
  {
    "Column1": "Back"
  },
  {
    "Column1": "Bad"
  },
  {
    "Column1": "Bag"
  },
  {
    "Column1": "Ball"
  },
  {
    "Column1": "Banana"
  },
  {
    "Column1": "Bank"
  },
  {
    "Column1": "Bar"
  },
  {
    "Column1": "Base"
  },
  {
    "Column1": "Basket"
  },
  {
    "Column1": "Bath"
  },
  {
    "Column1": "Battery"
  },
  {
    "Column1": "Beach"
  },
  {
    "Column1": "Bean"
  },
  {
    "Column1": "Bear"
  },
  {
    "Column1": "Beat"
  },
  {
    "Column1": "Beauty"
  },
  {
    "Column1": "Bed"
  },
  {
    "Column1": "Bee"
  },
  {
    "Column1": "Beer"
  },
  {
    "Column1": "Before"
  },
  {
    "Column1": "Begin"
  },
  {
    "Column1": "Behind"
  },
  {
    "Column1": "Bell"
  },
  {
    "Column1": "Belt"
  },
  {
    "Column1": "Bench"
  },
  {
    "Column1": "Best"
  },
  {
    "Column1": "Better"
  },
  {
    "Column1": "Between"
  },
  {
    "Column1": "Bicycle"
  },
  {
    "Column1": "Big"
  },
  {
    "Column1": "Bill"
  },
  {
    "Column1": "Bird"
  },
  {
    "Column1": "Birthday"
  },
  {
    "Column1": "Bite"
  },
  {
    "Column1": "Black"
  },
  {
    "Column1": "Blanket"
  },
  {
    "Column1": "Blind"
  },
  {
    "Column1": "Block"
  },
  {
    "Column1": "Blood"
  },
  {
    "Column1": "Blue"
  },
  {
    "Column1": "Boat"
  },
  {
    "Column1": "Body"
  },
  {
    "Column1": "Boil"
  },
  {
    "Column1": "Book"
  },
  {
    "Column1": "Boot"
  },
  {
    "Column1": "Border"
  },
  {
    "Column1": "Bottle"
  },
  {
    "Column1": "Bottom"
  },
  {
    "Column1": "Bowl"
  },
  {
    "Column1": "Box"
  },
  {
    "Column1": "Boy"
  },
  {
    "Column1": "Brain"
  },
  {
    "Column1": "Branch"
  },
  {
    "Column1": "Brave"
  },
  {
    "Column1": "Bread"
  },
  {
    "Column1": "Break"
  },
  {
    "Column1": "Breakfast"
  },
  {
    "Column1": "Breath"
  },
  {
    "Column1": "Bridge"
  },
  {
    "Column1": "Bright"
  },
  {
    "Column1": "Bring"
  },
  {
    "Column1": "Brother"
  },
  {
    "Column1": "Brown"
  },
  {
    "Column1": "Brush"
  },
  {
    "Column1": "Build"
  },
  {
    "Column1": "Burn"
  },
  {
    "Column1": "Bus"
  },
  {
    "Column1": "Business"
  },
  {
    "Column1": "Busy"
  },
  {
    "Column1": "But"
  },
  {
    "Column1": "Butter"
  },
  {
    "Column1": "Button"
  },
  {
    "Column1": "Buy"
  },
  {
    "Column1": "Bark"
  },
  {
    "Column1": "Bathe"
  },
  {
    "Column1": "Beat"
  },
  {
    "Column1": "Beautiful"
  },
  {
    "Column1": "Belt"
  },
  {
    "Column1": "Birds"
  },
  {
    "Column1": "Blissful"
  },
  {
    "Column1": "Bloom"
  },
  {
    "Column1": "Blow"
  },
  {
    "Column1": "Bow down"
  },
  {
    "Column1": "Break"
  },
  {
    "Column1": "Bucket"
  },
  {
    "Column1": "C"
  },
  {
    "Column1": "Cab"
  },
  {
    "Column1": "Cabin"
  },
  {
    "Column1": "Cabinet"
  },
  {
    "Column1": "Cable"
  },
  {
    "Column1": "Cadet"
  },
  {
    "Column1": "Cadre"
  },
  {
    "Column1": "Cage"
  },
  {
    "Column1": "Cajole"
  },
  {
    "Column1": "Calculate"
  },
  {
    "Column1": "Calf"
  },
  {
    "Column1": "Caliber"
  },
  {
    "Column1": "Call"
  },
  {
    "Column1": "Calm"
  },
  {
    "Column1": "Camp"
  },
  {
    "Column1": "Campaign"
  },
  {
    "Column1": "Campus"
  },
  {
    "Column1": "Canal"
  },
  {
    "Column1": "Cancel"
  },
  {
    "Column1": "Cat"
  },
  {
    "Column1": "Car"
  },
  {
    "Column1": "Cake"
  },
  {
    "Column1": "Chair"
  },
  {
    "Column1": "Cup"
  },
  {
    "Column1": "Cow"
  },
  {
    "Column1": "Coffee"
  },
  {
    "Column1": "Chocolate"
  },
  {
    "Column1": "Computer"
  },
  {
    "Column1": "Camera"
  },
  {
    "Column1": "City"
  },
  {
    "Column1": "Child"
  },
  {
    "Column1": "Cold"
  },
  {
    "Column1": "Close"
  },
  {
    "Column1": "Call"
  },
  {
    "Column1": "Clean"
  },
  {
    "Column1": "Clock"
  },
  {
    "Column1": "Cloud"
  },
  {
    "Column1": "Cook"
  },
  {
    "Column1": "Cry"
  },
  {
    "Column1": "Climb"
  },
  {
    "Column1": "Color"
  },
  {
    "Column1": "Circle"
  },
  {
    "Column1": "Copy"
  },
  {
    "Column1": "Create"
  },
  {
    "Column1": "Come"
  },
  {
    "Column1": "Catch"
  },
  {
    "Column1": "Change"
  },
  {
    "Column1": "Cut"
  },
  {
    "Column1": "Cover"
  },
  {
    "Column1": "Cost"
  },
  {
    "Column1": "Corn"
  },
  {
    "Column1": "Count"
  },
  {
    "Column1": "Combine"
  },
  {
    "Column1": "Country"
  },
  {
    "Column1": "Culture"
  },
  {
    "Column1": "Compare"
  },
  {
    "Column1": "Care"
  },
  {
    "Column1": "Card"
  },
  {
    "Column1": "Cheese"
  },
  {
    "Column1": "Chicken"
  },
  {
    "Column1": "Chalk"
  },
  {
    "Column1": "Candle"
  },
  {
    "Column1": "Cartoon"
  },
  {
    "Column1": "Clean"
  },
  {
    "Column1": "Clever"
  },
  {
    "Column1": "Clothe"
  },
  {
    "Column1": "Confuse"
  },
  {
    "Column1": "Continue"
  },
  {
    "Column1": "Cover"
  },
  {
    "Column1": "Cure"
  },
  {
    "Column1": "Cupboard"
  },
  {
    "Column1": "Currency"
  },
  {
    "Column1": "Custom"
  },
  {
    "Column1": "Cycle"
  },
  {
    "Column1": "Chance"
  },
  {
    "Column1": "Choice"
  },
  {
    "Column1": "Class"
  },
  {
    "Column1": "Clear"
  },
  {
    "Column1": "Cold"
  },
  {
    "Column1": "Comfort"
  },
  {
    "Column1": "Cough"
  },
  {
    "Column1": "Courage"
  },
  {
    "Column1": "Clever"
  },
  {
    "Column1": "Common"
  },
  {
    "Column1": "Control"
  },
  {
    "Column1": "Cover"
  },
  {
    "Column1": "Celebrate"
  },
  {
    "Column1": "Careful"
  },
  {
    "Column1": "Customer"
  },
  {
    "Column1": "Company"
  },
  {
    "Column1": "Century"
  },
  {
    "Column1": "Cell"
  },
  {
    "Column1": "Capital"
  },
  {
    "Column1": "Cloth"
  },
  {
    "Column1": "Category"
  },
  {
    "Column1": "College"
  },
  {
    "Column1": "Court"
  },
  {
    "Column1": "Castle"
  },
  {
    "Column1": "Crowd"
  },
  {
    "Column1": "Cook"
  },
  {
    "Column1": "Command"
  },
  {
    "Column1": "Cause"
  },
  {
    "Column1": "Course"
  },
  {
    "Column1": "Chain"
  },
  {
    "Column1": "Chief"
  },
  {
    "Column1": "Chose"
  },
  {
    "Column1": "Comfort"
  },
  {
    "Column1": "Cloudy"
  },
  {
    "Column1": "Craft"
  },
  {
    "Column1": "Crying"
  },
  {
    "Column1": "Cool"
  },
  {
    "Column1": "Conflict"
  },
  {
    "Column1": "Connect"
  },
  {
    "Column1": "Corner"
  },
  {
    "Column1": "Crash"
  },
  {
    "Column1": "Confirm"
  },
  {
    "Column1": "Classic"
  },
  {
    "Column1": "Cleanliness"
  },
  {
    "Column1": "Calendar"
  },
  {
    "Column1": "Car"
  },
  {
    "Column1": "Certificate"
  },
  {
    "Column1": "Cheap"
  },
  {
    "Column1": "Cheat"
  },
  {
    "Column1": "Chide"
  },
  {
    "Column1": "Children"
  },
  {
    "Column1": "Church"
  },
  {
    "Column1": "Clap"
  },
  {
    "Column1": "Clear"
  },
  {
    "Column1": "Clothes"
  },
  {
    "Column1": "Coffee"
  },
  {
    "Column1": "Coins"
  },
  {
    "Column1": "Comb"
  },
  {
    "Column1": "Come out"
  },
  {
    "Column1": "Commit suicide"
  },
  {
    "Column1": "Complete"
  },
  {
    "Column1": "Conquest"
  },
  {
    "Column1": "Consent"
  },
  {
    "Column1": "Contemplate"
  },
  {
    "Column1": "Conventional"
  },
  {
    "Column1": "Cook"
  },
  {
    "Column1": "Cost"
  },
  {
    "Column1": "Create"
  },
  {
    "Column1": "Curiosity"
  },
  {
    "Column1": "D"
  },
  {
    "Column1": "Dacoit"
  },
  {
    "Column1": "Daft"
  },
  {
    "Column1": "Daggle"
  },
  {
    "Column1": "Dairy"
  },
  {
    "Column1": "Dally"
  },
  {
    "Column1": "Dam"
  },
  {
    "Column1": "Damage"
  },
  {
    "Column1": "Dame"
  },
  {
    "Column1": "Damp"
  },
  {
    "Column1": "Dandle"
  },
  {
    "Column1": "Dandruff"
  },
  {
    "Column1": "Danger"
  },
  {
    "Column1": "Dazzle"
  },
  {
    "Column1": "Dealer"
  },
  {
    "Column1": "Dear"
  },
  {
    "Column1": "Dearth"
  },
  {
    "Column1": "Dimwit"
  },
  {
    "Column1": "Dolt"
  },
  {
    "Column1": "Dad"
  },
  {
    "Column1": "Daily"
  },
  {
    "Column1": "Damage"
  },
  {
    "Column1": "Dance"
  },
  {
    "Column1": "Danger"
  },
  {
    "Column1": "Dark"
  },
  {
    "Column1": "Date"
  },
  {
    "Column1": "Daughter"
  },
  {
    "Column1": "Day"
  },
  {
    "Column1": "Dead"
  },
  {
    "Column1": "Deal"
  },
  {
    "Column1": "Dear"
  },
  {
    "Column1": "Death"
  },
  {
    "Column1": "Debt"
  },
  {
    "Column1": "Decide"
  },
  {
    "Column1": "Decision"
  },
  {
    "Column1": "Deep"
  },
  {
    "Column1": "Defeat"
  },
  {
    "Column1": "Defend"
  },
  {
    "Column1": "Defense"
  },
  {
    "Column1": "Define"
  },
  {
    "Column1": "Degree"
  },
  {
    "Column1": "Delay"
  },
  {
    "Column1": "Deliver"
  },
  {
    "Column1": "Demand"
  },
  {
    "Column1": "Deny"
  },
  {
    "Column1": "Depend"
  },
  {
    "Column1": "Describe"
  },
  {
    "Column1": "Desert"
  },
  {
    "Column1": "Design"
  },
  {
    "Column1": "Desire"
  },
  {
    "Column1": "Desk"
  },
  {
    "Column1": "Destruction"
  },
  {
    "Column1": "Detail"
  },
  {
    "Column1": "Detect"
  },
  {
    "Column1": "Determine"
  },
  {
    "Column1": "Develop"
  },
  {
    "Column1": "Device"
  },
  {
    "Column1": "Dialogue"
  },
  {
    "Column1": "Die"
  },
  {
    "Column1": "Diet"
  },
  {
    "Column1": "Difference"
  },
  {
    "Column1": "Different"
  },
  {
    "Column1": "Difficult"
  },
  {
    "Column1": "Dig"
  },
  {
    "Column1": "Dinner"
  },
  {
    "Column1": "Direction"
  },
  {
    "Column1": "Dirt"
  },
  {
    "Column1": "Disable"
  },
  {
    "Column1": "Disagree"
  },
  {
    "Column1": "Disappear"
  },
  {
    "Column1": "Disaster"
  },
  {
    "Column1": "Discipline"
  },
  {
    "Column1": "Discover"
  },
  {
    "Column1": "Discuss"
  },
  {
    "Column1": "Disease"
  },
  {
    "Column1": "Dislike"
  },
  {
    "Column1": "Distance"
  },
  {
    "Column1": "Distinguish"
  },
  {
    "Column1": "Distract"
  },
  {
    "Column1": "Divide"
  },
  {
    "Column1": "Doctor"
  },
  {
    "Column1": "Document"
  },
  {
    "Column1": "Dog"
  },
  {
    "Column1": "Door"
  },
  {
    "Column1": "Doubt"
  },
  {
    "Column1": "Down"
  },
  {
    "Column1": "Draft"
  },
  {
    "Column1": "Drag"
  },
  {
    "Column1": "Drama"
  },
  {
    "Column1": "Draw"
  },
  {
    "Column1": "Dream"
  },
  {
    "Column1": "Dress"
  },
  {
    "Column1": "Drink"
  },
  {
    "Column1": "Drive"
  },
  {
    "Column1": "Drop"
  },
  {
    "Column1": "Dry"
  },
  {
    "Column1": "Dust"
  },
  {
    "Column1": "Duty"
  },
  {
    "Column1": "Dull"
  },
  {
    "Column1": "Dumb"
  },
  {
    "Column1": "Dump"
  },
  {
    "Column1": "Duplicate"
  },
  {
    "Column1": "Durable"
  },
  {
    "Column1": "Duration"
  },
  {
    "Column1": "Dusk"
  },
  {
    "Column1": "Dustbin"
  },
  {
    "Column1": "Dynamic"
  },
  {
    "Column1": "Dairy"
  },
  {
    "Column1": "Dandelion"
  },
  {
    "Column1": "Dare"
  },
  {
    "Column1": "Dash"
  },
  {
    "Column1": "Data"
  },
  {
    "Column1": "Deceive"
  },
  {
    "Column1": "Deck"
  },
  {
    "Column1": "Decorate"
  },
  {
    "Column1": "Delicious"
  },
  {
    "Column1": "Delight"
  },
  {
    "Column1": "Demolish"
  },
  {
    "Column1": "Den"
  },
  {
    "Column1": "Density"
  },
  {
    "Column1": "Dent"
  },
  {
    "Column1": "Depart"
  },
  {
    "Column1": "Deposit"
  },
  {
    "Column1": "Depress"
  },
  {
    "Column1": "Depth"
  },
  {
    "Column1": "Descend"
  },
  {
    "Column1": "Deserve"
  },
  {
    "Column1": "Detach"
  },
  {
    "Column1": "Detail"
  },
  {
    "Column1": "Diagram"
  },
  {
    "Column1": "Discount"
  },
  {
    "Column1": "Disgust"
  },
  {
    "Column1": "Dish"
  },
  {
    "Column1": "Display"
  },
  {
    "Column1": "Disturb"
  },
  {
    "Column1": "Dive"
  },
  {
    "Column1": "Divorce"
  },
  {
    "Column1": "Donate"
  },
  {
    "Column1": "Donor"
  },
  {
    "Column1": "Dose"
  },
  {
    "Column1": "Dot"
  },
  {
    "Column1": "Double"
  },
  {
    "Column1": "Dough"
  },
  {
    "Column1": "Drape"
  },
  {
    "Column1": "Draw"
  },
  {
    "Column1": "Drawer"
  },
  {
    "Column1": "Drift"
  },
  {
    "Column1": "Drill"
  },
  {
    "Column1": "Drive"
  },
  {
    "Column1": "Drought"
  },
  {
    "Column1": "Drum"
  },
  {
    "Column1": "Duck"
  },
  {
    "Column1": "Due"
  },
  {
    "Column1": "Duel"
  },
  {
    "Column1": "Dwarf"
  },
  {
    "Column1": "Dwell"
  },
  {
    "Column1": "Dye"
  },
  {
    "Column1": "Dangle"
  },
  {
    "Column1": "Dart"
  },
  {
    "Column1": "Database"
  },
  {
    "Column1": "Daughter-in-law"
  },
  {
    "Column1": "Deacon"
  },
  {
    "Column1": "Debris"
  },
  {
    "Column1": "Decade"
  },
  {
    "Column1": "Decay"
  },
  {
    "Column1": "December"
  },
  {
    "Column1": "Decipher"
  },
  {
    "Column1": "Declaration"
  },
  {
    "Column1": "Decline"
  },
  {
    "Column1": "Decor"
  },
  {
    "Column1": "Dedicate"
  },
  {
    "Column1": "Deduction"
  },
  {
    "Column1": "Deer"
  },
  {
    "Column1": "Defect"
  },
  {
    "Column1": "Definite"
  },
  {
    "Column1": "Deform"
  },
  {
    "Column1": "Delete"
  },
  {
    "Column1": "Delve"
  },
  {
    "Column1": "Dense"
  },
  {
    "Column1": "Depict"
  },
  {
    "Column1": "Depot"
  },
  {
    "Column1": "Desktop"
  },
  {
    "Column1": "Dessert"
  },
  {
    "Column1": "Destination"
  },
  {
    "Column1": "Destroy"
  },
  {
    "Column1": "Daring"
  },
  {
    "Column1": "Decide"
  },
  {
    "Column1": "Defeat"
  },
  {
    "Column1": "Dejection"
  },
  {
    "Column1": "Demand"
  },
  {
    "Column1": "Depend on"
  },
  {
    "Column1": "Desecration"
  },
  {
    "Column1": "Desperation"
  },
  {
    "Column1": "Diligent"
  },
  {
    "Column1": "Discrimination"
  },
  {
    "Column1": "Dissatisfied"
  },
  {
    "Column1": "Distribute"
  },
  {
    "Column1": "Disturb"
  },
  {
    "Column1": "Divide"
  },
  {
    "Column1": "Door"
  },
  {
    "Column1": "Doubt"
  },
  {
    "Column1": "Dream"
  },
  {
    "Column1": "E"
  },
  {
    "Column1": "Each"
  },
  {
    "Column1": "Eager"
  },
  {
    "Column1": "Earmark"
  },
  {
    "Column1": "Earn"
  },
  {
    "Column1": "Earnest"
  },
  {
    "Column1": "Earth"
  },
  {
    "Column1": "Earthquake"
  },
  {
    "Column1": "Ease"
  },
  {
    "Column1": "Eat"
  },
  {
    "Column1": "Ebony"
  },
  {
    "Column1": "Echo"
  },
  {
    "Column1": "Eclat"
  },
  {
    "Column1": "Economical"
  },
  {
    "Column1": "Ecstasy"
  },
  {
    "Column1": "Edge"
  },
  {
    "Column1": "Edible"
  },
  {
    "Column1": "Edit"
  },
  {
    "Column1": "Emotionality"
  },
  {
    "Column1": "Eager"
  },
  {
    "Column1": "Early"
  },
  {
    "Column1": "Earn"
  },
  {
    "Column1": "Earth"
  },
  {
    "Column1": "Ease"
  },
  {
    "Column1": "East"
  },
  {
    "Column1": "Easy"
  },
  {
    "Column1": "Eat"
  },
  {
    "Column1": "Echo"
  },
  {
    "Column1": "Ecology"
  },
  {
    "Column1": "Economic"
  },
  {
    "Column1": "Economy"
  },
  {
    "Column1": "Edge"
  },
  {
    "Column1": "Edit"
  },
  {
    "Column1": "Educate"
  },
  {
    "Column1": "Education"
  },
  {
    "Column1": "Effect"
  },
  {
    "Column1": "Effective"
  },
  {
    "Column1": "Efficient"
  },
  {
    "Column1": "Effort"
  },
  {
    "Column1": "Eight"
  },
  {
    "Column1": "Either"
  },
  {
    "Column1": "Elastic"
  },
  {
    "Column1": "Elder"
  },
  {
    "Column1": "Elect"
  },
  {
    "Column1": "Election"
  },
  {
    "Column1": "Electric"
  },
  {
    "Column1": "Electricity"
  },
  {
    "Column1": "Elegant"
  },
  {
    "Column1": "Element"
  },
  {
    "Column1": "Elephant"
  },
  {
    "Column1": "Elevate"
  },
  {
    "Column1": "Eleven"
  },
  {
    "Column1": "Eligible"
  },
  {
    "Column1": "Eliminate"
  },
  {
    "Column1": "Elite"
  },
  {
    "Column1": "Else"
  },
  {
    "Column1": "Embarrass"
  },
  {
    "Column1": "Embrace"
  },
  {
    "Column1": "Emergency"
  },
  {
    "Column1": "Emotion"
  },
  {
    "Column1": "Emphasis"
  },
  {
    "Column1": "Employ"
  },
  {
    "Column1": "Employee"
  },
  {
    "Column1": "Employer"
  },
  {
    "Column1": "Employment"
  },
  {
    "Column1": "Empty"
  },
  {
    "Column1": "Enable"
  },
  {
    "Column1": "Enact"
  },
  {
    "Column1": "Encounter"
  },
  {
    "Column1": "Encourage"
  },
  {
    "Column1": "End"
  },
  {
    "Column1": "Endanger"
  },
  {
    "Column1": "Endorse"
  },
  {
    "Column1": "Enemy"
  },
  {
    "Column1": "Energy"
  },
  {
    "Column1": "Engage"
  },
  {
    "Column1": "Engine"
  },
  {
    "Column1": "Engineer"
  },
  {
    "Column1": "Enhance"
  },
  {
    "Column1": "Enjoy"
  },
  {
    "Column1": "Enlarge"
  },
  {
    "Column1": "Enough"
  },
  {
    "Column1": "Enrich"
  },
  {
    "Column1": "Enter"
  },
  {
    "Column1": "Enterprise"
  },
  {
    "Column1": "Entertainment"
  },
  {
    "Column1": "Enthusiasm"
  },
  {
    "Column1": "Entire"
  },
  {
    "Column1": "Entrance"
  },
  {
    "Column1": "Envelope"
  },
  {
    "Column1": "Environment"
  },
  {
    "Column1": "Envy"
  },
  {
    "Column1": "Episode"
  },
  {
    "Column1": "Equal"
  },
  {
    "Column1": "Equation"
  },
  {
    "Column1": "Equip"
  },
  {
    "Column1": "Equipment"
  },
  {
    "Column1": "Equivalent"
  },
  {
    "Column1": "Era"
  },
  {
    "Column1": "Erect"
  },
  {
    "Column1": "Error"
  },
  {
    "Column1": "Escape"
  },
  {
    "Column1": "Especially"
  },
  {
    "Column1": "Essay"
  },
  {
    "Column1": "Essential"
  },
  {
    "Column1": "Establish"
  },
  {
    "Column1": "Estate"
  },
  {
    "Column1": "Estimate"
  },
  {
    "Column1": "Eternal"
  },
  {
    "Column1": "Ethics"
  },
  {
    "Column1": "Evacuate"
  },
  {
    "Column1": "Evaluate"
  },
  {
    "Column1": "Even"
  },
  {
    "Column1": "Evening"
  },
  {
    "Column1": "Event"
  },
  {
    "Column1": "Eventually"
  },
  {
    "Column1": "Ever"
  },
  {
    "Column1": "Every"
  },
  {
    "Column1": "Everyone"
  },
  {
    "Column1": "Evidence"
  },
  {
    "Column1": "Evil"
  },
  {
    "Column1": "Evolution"
  },
  {
    "Column1": "Exact"
  },
  {
    "Column1": "Exactly"
  },
  {
    "Column1": "Examine"
  },
  {
    "Column1": "Example"
  },
  {
    "Column1": "Exceed"
  },
  {
    "Column1": "Excellent"
  },
  {
    "Column1": "Except"
  },
  {
    "Column1": "Exchange"
  },
  {
    "Column1": "Excite"
  },
  {
    "Column1": "Exciting"
  },
  {
    "Column1": "Exclaim"
  },
  {
    "Column1": "Exclude"
  },
  {
    "Column1": "Excuse"
  },
  {
    "Column1": "Execute"
  },
  {
    "Column1": "Executive"
  },
  {
    "Column1": "Exercise"
  },
  {
    "Column1": "Exhibit"
  },
  {
    "Column1": "Exhibition"
  },
  {
    "Column1": "Exile"
  },
  {
    "Column1": "Exist"
  },
  {
    "Column1": "Exit"
  },
  {
    "Column1": "Expand"
  },
  {
    "Column1": "Expect"
  },
  {
    "Column1": "Expense"
  },
  {
    "Column1": "Expensive"
  },
  {
    "Column1": "Experience"
  },
  {
    "Column1": "Experiment"
  },
  {
    "Column1": "Expert"
  },
  {
    "Column1": "Explain"
  },
  {
    "Column1": "Explanation"
  },
  {
    "Column1": "Explore"
  },
  {
    "Column1": "Export"
  },
  {
    "Column1": "Expose"
  },
  {
    "Column1": "Express"
  },
  {
    "Column1": "Extend"
  },
  {
    "Column1": "Extension"
  },
  {
    "Column1": "Extensive"
  },
  {
    "Column1": "Extent"
  },
  {
    "Column1": "External"
  },
  {
    "Column1": "Extra"
  },
  {
    "Column1": "Extraordinary"
  },
  {
    "Column1": "Extreme"
  },
  {
    "Column1": "Eye"
  },
  {
    "Column1": "Eyebrow"
  },
  {
    "Column1": "Eyelash"
  },
  {
    "Column1": "Eyewitness"
  },
  {
    "Column1": "Eagerly"
  },
  {
    "Column1": "Earnest"
  },
  {
    "Column1": "Earthquake"
  },
  {
    "Column1": "Eastern"
  },
  {
    "Column1": "Echoes"
  },
  {
    "Column1": "Economical"
  },
  {
    "Column1": "Eccentric"
  },
  {
    "Column1": "Edgewise"
  },
  {
    "Column1": "Edible"
  },
  {
    "Column1": "Editor"
  },
  {
    "Column1": "Educator"
  },
  {
    "Column1": "Effectively"
  },
  {
    "Column1": "Efficiency"
  },
  {
    "Column1": "Effortless"
  },
  {
    "Column1": "Egg"
  },
  {
    "Column1": "Elaborate"
  },
  {
    "Column1": "Elasticity"
  },
  {
    "Column1": "Electrify"
  },
  {
    "Column1": "Eligible"
  },
  {
    "Column1": "Eloquent"
  },
  {
    "Column1": "Embark"
  },
  {
    "Column1": "Embody"
  },
  {
    "Column1": "Emigrant"
  },
  {
    "Column1": "Eminent"
  },
  {
    "Column1": "Emit"
  },
  {
    "Column1": "Emotional"
  },
  {
    "Column1": "Empathy"
  },
  {
    "Column1": "Empirical"
  },
  {
    "Column1": "Empower"
  },
  {
    "Column1": "Encompass"
  },
  {
    "Column1": "Encounter"
  },
  {
    "Column1": "Endorsement"
  },
  {
    "Column1": "Endurance"
  },
  {
    "Column1": "Enemy"
  },
  {
    "Column1": "Energetic"
  },
  {
    "Column1": "Enforce"
  },
  {
    "Column1": "Engaged"
  },
  {
    "Column1": "Engagement"
  },
  {
    "Column1": "Engineer"
  },
  {
    "Column1": "Engrave"
  },
  {
    "Column1": "Enlist"
  },
  {
    "Column1": "Enlighten"
  },
  {
    "Column1": "Ensure"
  },
  {
    "Column1": "Entertain"
  },
  {
    "Column1": "Enthusiastic"
  },
  {
    "Column1": "Entirely"
  },
  {
    "Column1": "Entrust"
  },
  {
    "Column1": "Environmentally"
  },
  {
    "Column1": "Equalize"
  },
  {
    "Column1": "Equally"
  },
  {
    "Column1": "Equate"
  },
  {
    "Column1": "Equilibrium"
  },
  {
    "Column1": "Erosion"
  },
  {
    "Column1": "Erroneous"
  },
  {
    "Column1": "Escape"
  },
  {
    "Column1": "Essayist"
  },
  {
    "Column1": "Establishment"
  },
  {
    "Column1": "Esteem"
  },
  {
    "Column1": "Eternity"
  },
  {
    "Column1": "Ethical"
  },
  {
    "Column1": "Eulogize"
  },
  {
    "Column1": "Euphoric"
  },
  {
    "Column1": "Enjoy"
  },
  {
    "Column1": "Everywhere"
  },
  {
    "Column1": "Excuse me"
  },
  {
    "Column1": "Exercise"
  },
  {
    "Column1": "Exploit"
  },
  {
    "Column1": "F"
  },
  {
    "Column1": "Fabric"
  },
  {
    "Column1": "Fabricate"
  },
  {
    "Column1": "Fabulous"
  },
  {
    "Column1": "Face"
  },
  {
    "Column1": "Facility"
  },
  {
    "Column1": "Fact"
  },
  {
    "Column1": "Factory"
  },
  {
    "Column1": "Faculty"
  },
  {
    "Column1": "Fade"
  },
  {
    "Column1": "Fail"
  },
  {
    "Column1": "Failure"
  },
  {
    "Column1": "Faint"
  },
  {
    "Column1": "Fainting"
  },
  {
    "Column1": "Fair"
  },
  {
    "Column1": "Faith"
  },
  {
    "Column1": "Factoid"
  },
  {
    "Column1": "Fail"
  },
  {
    "Column1": "Fair"
  },
  {
    "Column1": "False"
  },
  {
    "Column1": "Fall"
  },
  {
    "Column1": "Fame"
  },
  {
    "Column1": "Familiar"
  },
  {
    "Column1": "Family"
  },
  {
    "Column1": "Famous"
  },
  {
    "Column1": "Fan"
  },
  {
    "Column1": "Fancy"
  },
  {
    "Column1": "Fantastic"
  },
  {
    "Column1": "Far"
  },
  {
    "Column1": "Farm"
  },
  {
    "Column1": "Farmer"
  },
  {
    "Column1": "Fashion"
  },
  {
    "Column1": "Fast"
  },
  {
    "Column1": "Fat"
  },
  {
    "Column1": "Fate"
  },
  {
    "Column1": "Father"
  },
  {
    "Column1": "Fault"
  },
  {
    "Column1": "Favor"
  },
  {
    "Column1": "Fear"
  },
  {
    "Column1": "Feather"
  },
  {
    "Column1": "Feature"
  },
  {
    "Column1": "February"
  },
  {
    "Column1": "Fee"
  },
  {
    "Column1": "Feed"
  },
  {
    "Column1": "Feel"
  },
  {
    "Column1": "Fellow"
  },
  {
    "Column1": "Female"
  },
  {
    "Column1": "Fence"
  },
  {
    "Column1": "Festival"
  },
  {
    "Column1": "Few"
  },
  {
    "Column1": "Fiber"
  },
  {
    "Column1": "Fiction"
  },
  {
    "Column1": "Field"
  },
  {
    "Column1": "Fifteen"
  },
  {
    "Column1": "Fifth"
  },
  {
    "Column1": "Fifty"
  },
  {
    "Column1": "Fight"
  },
  {
    "Column1": "Figure"
  },
  {
    "Column1": "File"
  },
  {
    "Column1": "Fill"
  },
  {
    "Column1": "Film"
  },
  {
    "Column1": "Final"
  },
  {
    "Column1": "Finance"
  },
  {
    "Column1": "Find"
  },
  {
    "Column1": "Fine"
  },
  {
    "Column1": "Finger"
  },
  {
    "Column1": "Finish"
  },
  {
    "Column1": "Fire"
  },
  {
    "Column1": "Firm"
  },
  {
    "Column1": "First"
  },
  {
    "Column1": "Fish"
  },
  {
    "Column1": "Fit"
  },
  {
    "Column1": "Five"
  },
  {
    "Column1": "Fix"
  },
  {
    "Column1": "Flag"
  },
  {
    "Column1": "Flame"
  },
  {
    "Column1": "Flash"
  },
  {
    "Column1": "Flat"
  },
  {
    "Column1": "Flavor"
  },
  {
    "Column1": "Fleet"
  },
  {
    "Column1": "Flesh"
  },
  {
    "Column1": "Flight"
  },
  {
    "Column1": "Floor"
  },
  {
    "Column1": "Flour"
  },
  {
    "Column1": "Flower"
  },
  {
    "Column1": "Fly"
  },
  {
    "Column1": "Focus"
  },
  {
    "Column1": "Fold"
  },
  {
    "Column1": "Follow"
  },
  {
    "Column1": "Food"
  },
  {
    "Column1": "Fool"
  },
  {
    "Column1": "Foot"
  },
  {
    "Column1": "Football"
  },
  {
    "Column1": "For"
  },
  {
    "Column1": "Force"
  },
  {
    "Column1": "Forest"
  },
  {
    "Column1": "Forget"
  },
  {
    "Column1": "Forgive"
  },
  {
    "Column1": "Fork"
  },
  {
    "Column1": "Form"
  },
  {
    "Column1": "Formal"
  },
  {
    "Column1": "Former"
  },
  {
    "Column1": "Fort"
  },
  {
    "Column1": "Fortune"
  },
  {
    "Column1": "Forward"
  },
  {
    "Column1": "Found"
  },
  {
    "Column1": "Foundation"
  },
  {
    "Column1": "Four"
  },
  {
    "Column1": "Frame"
  },
  {
    "Column1": "Free"
  },
  {
    "Column1": "Freedom"
  },
  {
    "Column1": "Freeze"
  },
  {
    "Column1": "Frequent"
  },
  {
    "Column1": "Fresh"
  },
  {
    "Column1": "Friend"
  },
  {
    "Column1": "Friendly"
  },
  {
    "Column1": "Friendship"
  },
  {
    "Column1": "Frighten"
  },
  {
    "Column1": "Frog"
  },
  {
    "Column1": "From"
  },
  {
    "Column1": "Front"
  },
  {
    "Column1": "Fruit"
  },
  {
    "Column1": "Fry"
  },
  {
    "Column1": "Fuel"
  },
  {
    "Column1": "Full"
  },
  {
    "Column1": "Fun"
  },
  {
    "Column1": "Function"
  },
  {
    "Column1": "Fund"
  },
  {
    "Column1": "Fundamental"
  },
  {
    "Column1": "Funeral"
  },
  {
    "Column1": "Funny"
  },
  {
    "Column1": "Fur"
  },
  {
    "Column1": "Furniture"
  },
  {
    "Column1": "Further"
  },
  {
    "Column1": "Future"
  },
  {
    "Column1": "Fabulous"
  },
  {
    "Column1": "Faint"
  },
  {
    "Column1": "Fake"
  },
  {
    "Column1": "Flaw"
  },
  {
    "Column1": "Flatter"
  },
  {
    "Column1": "Foolish"
  },
  {
    "Column1": "Frown"
  },
  {
    "Column1": "Fruitful"
  },
  {
    "Column1": "Frustrate"
  },
  {
    "Column1": "Fulfill"
  },
  {
    "Column1": "Fuse"
  },
  {
    "Column1": "Feeble"
  },
  {
    "Column1": "Flock"
  },
  {
    "Column1": "Flush"
  },
  {
    "Column1": "Frail"
  },
  {
    "Column1": "Flea"
  },
  {
    "Column1": "Fret"
  },
  {
    "Column1": "Frugal"
  },
  {
    "Column1": "Fume"
  },
  {
    "Column1": "Fidget"
  },
  {
    "Column1": "Fissure"
  },
  {
    "Column1": "Flee"
  },
  {
    "Column1": "Forbid"
  },
  {
    "Column1": "Flog"
  },
  {
    "Column1": "Folly"
  },
  {
    "Column1": "Friction"
  },
  {
    "Column1": "Frolic"
  },
  {
    "Column1": "Froth"
  },
  {
    "Column1": "Fungus"
  },
  {
    "Column1": "Fusion"
  },
  {
    "Column1": "Furtive"
  },
  {
    "Column1": "Fable"
  },
  {
    "Column1": "Fiddle"
  },
  {
    "Column1": "Figurative"
  },
  {
    "Column1": "Fitful"
  },
  {
    "Column1": "Flimsy"
  },
  {
    "Column1": "Foil"
  },
  {
    "Column1": "Footprint"
  },
  {
    "Column1": "Fortitude"
  },
  {
    "Column1": "Fetch"
  },
  {
    "Column1": "Faction"
  },
  {
    "Column1": "Façade"
  },
  {
    "Column1": "Feign"
  },
  {
    "Column1": "Finale"
  },
  {
    "Column1": "Flare"
  },
  {
    "Column1": "Fortnight"
  },
  {
    "Column1": "Funnel"
  },
  {
    "Column1": "Fauna"
  },
  {
    "Column1": "Feline"
  },
  {
    "Column1": "Fiscal"
  },
  {
    "Column1": "Fission"
  },
  {
    "Column1": "Folklore"
  },
  {
    "Column1": "Flamboyant"
  },
  {
    "Column1": "Fanciful"
  },
  {
    "Column1": "Fluctuate"
  },
  {
    "Column1": "Footage"
  },
  {
    "Column1": "Foresight"
  },
  {
    "Column1": "Foresee"
  },
  {
    "Column1": "Foretell"
  },
  {
    "Column1": "Fortify"
  },
  {
    "Column1": "Fracture"
  },
  {
    "Column1": "Fragment"
  },
  {
    "Column1": "Fragrance"
  },
  {
    "Column1": "Frenzy"
  },
  {
    "Column1": "Fringe"
  },
  {
    "Column1": "Furlough"
  },
  {
    "Column1": "Face"
  },
  {
    "Column1": "Fascinated"
  },
  {
    "Column1": "Favour"
  },
  {
    "Column1": "Fictional"
  },
  {
    "Column1": "Fight"
  },
  {
    "Column1": "Find"
  },
  {
    "Column1": "Find out"
  },
  {
    "Column1": "Firm"
  },
  {
    "Column1": "Flee away"
  },
  {
    "Column1": "Flow"
  },
  {
    "Column1": "Flowers"
  },
  {
    "Column1": "Food"
  },
  {
    "Column1": "Force"
  },
  {
    "Column1": "Fork"
  },
  {
    "Column1": "Fountain"
  },
  {
    "Column1": "Fruits"
  },
  {
    "Column1": "Furious"
  },
  {
    "Column1": "G"
  },
  {
    "Column1": "Gain"
  },
  {
    "Column1": "Gamble"
  },
  {
    "Column1": "Game"
  },
  {
    "Column1": "Gaming"
  },
  {
    "Column1": "Gap"
  },
  {
    "Column1": "Garb"
  },
  {
    "Column1": "Garden"
  },
  {
    "Column1": "Garnish"
  },
  {
    "Column1": "Garment"
  },
  {
    "Column1": "Garish"
  },
  {
    "Column1": "Gate"
  },
  {
    "Column1": "Gather"
  },
  {
    "Column1": "Generally"
  },
  {
    "Column1": "Gem"
  },
  {
    "Column1": "Generate"
  },
  {
    "Column1": "Garbage"
  },
  {
    "Column1": "Gentle"
  },
  {
    "Column1": "Gift"
  },
  {
    "Column1": "Girl"
  },
  {
    "Column1": "Give"
  },
  {
    "Column1": "Glad"
  },
  {
    "Column1": "Glass"
  },
  {
    "Column1": "Goal"
  },
  {
    "Column1": "Good"
  },
  {
    "Column1": "Grade"
  },
  {
    "Column1": "Grand"
  },
  {
    "Column1": "Grapes"
  },
  {
    "Column1": "Grass"
  },
  {
    "Column1": "Great"
  },
  {
    "Column1": "Green"
  },
  {
    "Column1": "Grow"
  },
  {
    "Column1": "Grateful"
  },
  {
    "Column1": "Group"
  },
  {
    "Column1": "Guide"
  },
  {
    "Column1": "Guard"
  },
  {
    "Column1": "Guess"
  },
  {
    "Column1": "Gum"
  },
  {
    "Column1": "Grown"
  },
  {
    "Column1": "Greet"
  },
  {
    "Column1": "Glow"
  },
  {
    "Column1": "Gown"
  },
  {
    "Column1": "Gesture"
  },
  {
    "Column1": "Garlic"
  },
  {
    "Column1": "Garage"
  },
  {
    "Column1": "Gambler"
  },
  {
    "Column1": "Grin"
  },
  {
    "Column1": "Grasp"
  },
  {
    "Column1": "Grind"
  },
  {
    "Column1": "Gala"
  },
  {
    "Column1": "Glee"
  },
  {
    "Column1": "Glimpse"
  },
  {
    "Column1": "Gaze"
  },
  {
    "Column1": "Gloom"
  },
  {
    "Column1": "Gold"
  },
  {
    "Column1": "Glory"
  },
  {
    "Column1": "Guilt"
  },
  {
    "Column1": "Gainful"
  },
  {
    "Column1": "Gentlemen"
  },
  {
    "Column1": "Grumble"
  },
  {
    "Column1": "Goblet"
  },
  {
    "Column1": "Glimmer"
  },
  {
    "Column1": "Groove"
  },
  {
    "Column1": "Grindstone"
  },
  {
    "Column1": "Gale"
  },
  {
    "Column1": "Gait"
  },
  {
    "Column1": "Gash"
  },
  {
    "Column1": "Gulp"
  },
  {
    "Column1": "Glisten"
  },
  {
    "Column1": "Gallery"
  },
  {
    "Column1": "Gully"
  },
  {
    "Column1": "Gazebo"
  },
  {
    "Column1": "Giddy"
  },
  {
    "Column1": "Graft"
  },
  {
    "Column1": "Gambit"
  },
  {
    "Column1": "Galore"
  },
  {
    "Column1": "Gadget"
  },
  {
    "Column1": "Gradient"
  },
  {
    "Column1": "Grapple"
  },
  {
    "Column1": "Guzzle"
  },
  {
    "Column1": "Gaiter"
  },
  {
    "Column1": "Goose"
  },
  {
    "Column1": "Glance"
  },
  {
    "Column1": "Grief"
  },
  {
    "Column1": "Guardian"
  },
  {
    "Column1": "Goblin"
  },
  {
    "Column1": "Glitter"
  },
  {
    "Column1": "Gracious"
  },
  {
    "Column1": "Glider"
  },
  {
    "Column1": "Grab"
  },
  {
    "Column1": "Goad"
  },
  {
    "Column1": "Garble"
  },
  {
    "Column1": "Glare"
  },
  {
    "Column1": "Gleeful"
  },
  {
    "Column1": "Gloat"
  },
  {
    "Column1": "Grandeur"
  },
  {
    "Column1": "Gag"
  },
  {
    "Column1": "Gavel"
  },
  {
    "Column1": "Grim"
  },
  {
    "Column1": "Gamut"
  },
  {
    "Column1": "Gallop"
  },
  {
    "Column1": "Grit"
  },
  {
    "Column1": "Grime"
  },
  {
    "Column1": "Gauge"
  },
  {
    "Column1": "Gloomy"
  },
  {
    "Column1": "Gnarled"
  },
  {
    "Column1": "Garrison"
  },
  {
    "Column1": "Gremlin"
  },
  {
    "Column1": "Gyrate"
  },
  {
    "Column1": "Glint"
  },
  {
    "Column1": "Grimy"
  },
  {
    "Column1": "Grimace"
  },
  {
    "Column1": "Grudge"
  },
  {
    "Column1": "Gossamer"
  },
  {
    "Column1": "Glorify"
  },
  {
    "Column1": "Grunt"
  },
  {
    "Column1": "Grabble"
  },
  {
    "Column1": "Gnaw"
  },
  {
    "Column1": "Grandiloquent"
  },
  {
    "Column1": "Gobbledygook"
  },
  {
    "Column1": "Glorification"
  },
  {
    "Column1": "Gory"
  },
  {
    "Column1": "Gravitational"
  },
  {
    "Column1": "Glacial"
  },
  {
    "Column1": "Gravitate"
  },
  {
    "Column1": "Grasping"
  },
  {
    "Column1": "Grandiloquence"
  },
  {
    "Column1": "Gallivant"
  },
  {
    "Column1": "Grizzle"
  },
  {
    "Column1": "Ground"
  },
  {
    "Column1": "Gambol"
  },
  {
    "Column1": "Genuine"
  },
  {
    "Column1": "Goodbye"
  },
  {
    "Column1": "Govern"
  },
  {
    "Column1": "Grill"
  },
  {
    "Column1": "H"
  },
  {
    "Column1": "Habit"
  },
  {
    "Column1": "Hail"
  },
  {
    "Column1": "Hale"
  },
  {
    "Column1": "Halt"
  },
  {
    "Column1": "Hand"
  },
  {
    "Column1": "Handicraft"
  },
  {
    "Column1": "Handkerchief"
  },
  {
    "Column1": "Handmade"
  },
  {
    "Column1": "Handsome"
  },
  {
    "Column1": "Hang"
  },
  {
    "Column1": "Happen"
  },
  {
    "Column1": "Happy"
  },
  {
    "Column1": "Harass"
  },
  {
    "Column1": "Hard"
  },
  {
    "Column1": "Hardly"
  },
  {
    "Column1": "Hardship"
  },
  {
    "Column1": "Hardwoking"
  },
  {
    "Column1": "House"
  },
  {
    "Column1": "Help"
  },
  {
    "Column1": "Head"
  },
  {
    "Column1": "Heart"
  },
  {
    "Column1": "Home"
  },
  {
    "Column1": "Hope"
  },
  {
    "Column1": "Hot"
  },
  {
    "Column1": "High"
  },
  {
    "Column1": "Hair"
  },
  {
    "Column1": "Honey"
  },
  {
    "Column1": "Hour"
  },
  {
    "Column1": "Homework"
  },
  {
    "Column1": "Hospital"
  },
  {
    "Column1": "History"
  },
  {
    "Column1": "Holiday"
  },
  {
    "Column1": "Hurt"
  },
  {
    "Column1": "Humble"
  },
  {
    "Column1": "Harsh"
  },
  {
    "Column1": "Heavy"
  },
  {
    "Column1": "Healthy"
  },
  {
    "Column1": "Hopeful"
  },
  {
    "Column1": "Honor"
  },
  {
    "Column1": "Humidity"
  },
  {
    "Column1": "Hasty"
  },
  {
    "Column1": "Harmony"
  },
  {
    "Column1": "Harvest"
  },
  {
    "Column1": "Hustle"
  },
  {
    "Column1": "Hilarious"
  },
  {
    "Column1": "Helpless"
  },
  {
    "Column1": "Heritage"
  },
  {
    "Column1": "Hero"
  },
  {
    "Column1": "Homeless"
  },
  {
    "Column1": "Highlight"
  },
  {
    "Column1": "Honeymoon"
  },
  {
    "Column1": "Host"
  },
  {
    "Column1": "Huddle"
  },
  {
    "Column1": "Hoard"
  },
  {
    "Column1": "Hound"
  },
  {
    "Column1": "Hazard"
  },
  {
    "Column1": "Hygiene"
  },
  {
    "Column1": "Hologram"
  },
  {
    "Column1": "Hallway"
  },
  {
    "Column1": "Hinge"
  },
  {
    "Column1": "Hiccup"
  },
  {
    "Column1": "Homage"
  },
  {
    "Column1": "Headache"
  },
  {
    "Column1": "Heed"
  },
  {
    "Column1": "Hear"
  },
  {
    "Column1": "Hasten"
  },
  {
    "Column1": "Hierarchy"
  },
  {
    "Column1": "Harmonize"
  },
  {
    "Column1": "Hypothesis"
  },
  {
    "Column1": "Handbook"
  },
  {
    "Column1": "Hedge"
  },
  {
    "Column1": "Hurdle"
  },
  {
    "Column1": "Haste"
  },
  {
    "Column1": "Hereditary"
  },
  {
    "Column1": "Humiliation"
  },
  {
    "Column1": "Habitual"
  },
  {
    "Column1": "Harassment"
  },
  {
    "Column1": "Honorary"
  },
  {
    "Column1": "Hallucination"
  },
  {
    "Column1": "Holistic"
  },
  {
    "Column1": "Headstrong"
  },
  {
    "Column1": "Homeopathy"
  },
  {
    "Column1": "Hectic"
  },
  {
    "Column1": "Hibernation"
  },
  {
    "Column1": "Hallowed"
  },
  {
    "Column1": "Holographic"
  },
  {
    "Column1": "Heat"
  },
  {
    "Column1": "Hypocritical"
  },
  {
    "Column1": "Hurdles"
  },
  {
    "Column1": "Hemoglobin"
  },
  {
    "Column1": "Hectare"
  },
  {
    "Column1": "Housekeeper"
  },
  {
    "Column1": "Hurdling"
  },
  {
    "Column1": "Humility"
  },
  {
    "Column1": "Headline"
  },
  {
    "Column1": "Hostility"
  },
  {
    "Column1": "Hollow"
  },
  {
    "Column1": "Hatch"
  },
  {
    "Column1": "Haphazard"
  },
  {
    "Column1": "Harm"
  },
  {
    "Column1": "Hate"
  },
  {
    "Column1": "Hello"
  },
  {
    "Column1": "Her"
  },
  {
    "Column1": "Here"
  },
  {
    "Column1": "Him"
  },
  {
    "Column1": "Human"
  },
  {
    "Column1": "I"
  },
  {
    "Column1": "Identical"
  },
  {
    "Column1": "Ideology"
  },
  {
    "Column1": "Idiosyncrasy"
  },
  {
    "Column1": "Idle"
  },
  {
    "Column1": "Illuminate"
  },
  {
    "Column1": "Illuminating"
  },
  {
    "Column1": "Imaginative"
  },
  {
    "Column1": "Imbibe"
  },
  {
    "Column1": "Immaterial"
  },
  {
    "Column1": "Imminent"
  },
  {
    "Column1": "Immunity"
  },
  {
    "Column1": "Impact"
  },
  {
    "Column1": "Impair"
  },
  {
    "Column1": "Impart"
  },
  {
    "Column1": "Impeach"
  },
  {
    "Column1": "Impeachment"
  },
  {
    "Column1": "Impede"
  },
  {
    "Column1": "Impediment"
  },
  {
    "Column1": "Impel"
  },
  {
    "Column1": "Imperative"
  },
  {
    "Column1": "Imperative need"
  },
  {
    "Column1": "Imperishable"
  },
  {
    "Column1": "Impetus"
  },
  {
    "Column1": "Implacable"
  },
  {
    "Column1": "Implicate"
  },
  {
    "Column1": "Implication"
  },
  {
    "Column1": "Implicit"
  },
  {
    "Column1": "Implicit faith"
  },
  {
    "Column1": "Implore"
  },
  {
    "Column1": "Imply"
  },
  {
    "Column1": "Imposing"
  },
  {
    "Column1": "Improvise"
  },
  {
    "Column1": "Impulse"
  },
  {
    "Column1": "Ice"
  },
  {
    "Column1": "Idea"
  },
  {
    "Column1": "Ideal"
  },
  {
    "Column1": "Identify"
  },
  {
    "Column1": "Identity"
  },
  {
    "Column1": "Ignore"
  },
  {
    "Column1": "Ill"
  },
  {
    "Column1": "Illegal"
  },
  {
    "Column1": "Illustrate"
  },
  {
    "Column1": "Image"
  },
  {
    "Column1": "Imagine"
  },
  {
    "Column1": "Immediate"
  },
  {
    "Column1": "Important"
  },
  {
    "Column1": "Impress"
  },
  {
    "Column1": "Improve"
  },
  {
    "Column1": "Information"
  },
  {
    "Column1": "In"
  },
  {
    "Column1": "Include"
  },
  {
    "Column1": "Increase"
  },
  {
    "Column1": "Indicate"
  },
  {
    "Column1": "Individual"
  },
  {
    "Column1": "Industry"
  },
  {
    "Column1": "Influence"
  },
  {
    "Column1": "Inform"
  },
  {
    "Column1": "Initial"
  },
  {
    "Column1": "Initiative"
  },
  {
    "Column1": "Inner"
  },
  {
    "Column1": "Insert"
  },
  {
    "Column1": "Insist"
  },
  {
    "Column1": "Instance"
  },
  {
    "Column1": "Instantly"
  },
  {
    "Column1": "Instruction"
  },
  {
    "Column1": "Instrument"
  },
  {
    "Column1": "Insurance"
  },
  {
    "Column1": "Intend"
  },
  {
    "Column1": "Interest"
  },
  {
    "Column1": "Interesting"
  },
  {
    "Column1": "International"
  },
  {
    "Column1": "Internet"
  },
  {
    "Column1": "Interview"
  },
  {
    "Column1": "Introduce"
  },
  {
    "Column1": "Invitation"
  },
  {
    "Column1": "Involve"
  },
  {
    "Column1": "Iron"
  },
  {
    "Column1": "Island"
  },
  {
    "Column1": "Issue"
  },
  {
    "Column1": "It"
  },
  {
    "Column1": "Item"
  },
  {
    "Column1": "Idealism"
  },
  {
    "Column1": "Identity theft"
  },
  {
    "Column1": "Illness"
  },
  {
    "Column1": "Imagineer"
  },
  {
    "Column1": "Impatient"
  },
  {
    "Column1": "Income"
  },
  {
    "Column1": "Indifferent"
  },
  {
    "Column1": "Indirect"
  },
  {
    "Column1": "Informal"
  },
  {
    "Column1": "Initials"
  },
  {
    "Column1": "Inquire"
  },
  {
    "Column1": "Inquisitive"
  },
  {
    "Column1": "Insight"
  },
  {
    "Column1": "Inscription"
  },
  {
    "Column1": "Integration"
  },
  {
    "Column1": "Intensity"
  },
  {
    "Column1": "Intent"
  },
  {
    "Column1": "Interact"
  },
  {
    "Column1": "Interfere"
  },
  {
    "Column1": "Interval"
  },
  {
    "Column1": "Invincible"
  },
  {
    "Column1": "Invention"
  },
  {
    "Column1": "Inventory"
  },
  {
    "Column1": "Invite"
  },
  {
    "Column1": "Imagination"
  },
  {
    "Column1": "Immediate effect"
  },
  {
    "Column1": "Impossible"
  },
  {
    "Column1": "Import"
  },
  {
    "Column1": "Impactful"
  },
  {
    "Column1": "Income tax"
  },
  {
    "Column1": "Irregular"
  },
  {
    "Column1": "In-depth"
  },
  {
    "Column1": "Influence peddling"
  },
  {
    "Column1": "Immigrate"
  },
  {
    "Column1": "Illumination"
  },
  {
    "Column1": "Importantly"
  },
  {
    "Column1": "Incapable"
  },
  {
    "Column1": "Incidence"
  },
  {
    "Column1": "Incur"
  },
  {
    "Column1": "Interference"
  },
  {
    "Column1": "Intuition"
  },
  {
    "Column1": "Initiative taker"
  },
  {
    "Column1": "Intervene"
  },
  {
    "Column1": "Infamous"
  },
  {
    "Column1": "Infection"
  },
  {
    "Column1": "Inhibit"
  },
  {
    "Column1": "Integrity"
  },
  {
    "Column1": "Insult"
  },
  {
    "Column1": "Insulting"
  },
  {
    "Column1": "Interpret"
  },
  {
    "Column1": "Intimidate"
  },
  {
    "Column1": "Inhabitant"
  },
  {
    "Column1": "Inclination"
  },
  {
    "Column1": "Invader"
  },
  {
    "Column1": "Involuntary"
  },
  {
    "Column1": "Insecure"
  },
  {
    "Column1": "Inflection"
  },
  {
    "Column1": "Inference"
  },
  {
    "Column1": "Inequality"
  },
  {
    "Column1": "Impartial"
  },
  {
    "Column1": "Irresistible"
  },
  {
    "Column1": "Instrumental"
  },
  {
    "Column1": "Interpretation"
  },
  {
    "Column1": "Introspection"
  },
  {
    "Column1": "Insatiable"
  },
  {
    "Column1": "Inquisition"
  },
  {
    "Column1": "Inhabit"
  },
  {
    "Column1": "Incite"
  },
  {
    "Column1": "Infirmity"
  },
  {
    "Column1": "Impact assessment"
  },
  {
    "Column1": "Inclusion"
  },
  {
    "Column1": "Insightful"
  },
  {
    "Column1": "Intolerant"
  },
  {
    "Column1": "Irreplaceable"
  },
  {
    "Column1": "Intercept"
  },
  {
    "Column1": "Inconvenience"
  },
  {
    "Column1": "Insidious"
  },
  {
    "Column1": "Illogical"
  },
  {
    "Column1": "Imprecise"
  },
  {
    "Column1": "Inflexible"
  },
  {
    "Column1": "Intolerable"
  },
  {
    "Column1": "Interrelationship"
  },
  {
    "Column1": "Inescapable"
  },
  {
    "Column1": "Indispensable"
  },
  {
    "Column1": "Incomprehensible"
  },
  {
    "Column1": "Inward"
  },
  {
    "Column1": "Intermittent"
  },
  {
    "Column1": "Impeccable"
  },
  {
    "Column1": "Instinct"
  },
  {
    "Column1": "Innovate"
  },
  {
    "Column1": "Install"
  },
  {
    "Column1": "Imposter"
  },
  {
    "Column1": "Inundate"
  },
  {
    "Column1": "Inclined"
  },
  {
    "Column1": "Inconclusive"
  },
  {
    "Column1": "Irate"
  },
  {
    "Column1": "Imposition"
  },
  {
    "Column1": "Inherent"
  },
  {
    "Column1": "Intelligence"
  },
  {
    "Column1": "Intermediary"
  },
  {
    "Column1": "Interrogation"
  },
  {
    "Column1": "Intricate"
  },
  {
    "Column1": "Independent"
  },
  {
    "Column1": "Inspect"
  },
  {
    "Column1": "Inundation"
  },
  {
    "Column1": "J"
  },
  {
    "Column1": "Jeopardy"
  },
  {
    "Column1": "Jettison"
  },
  {
    "Column1": "Join hand with"
  },
  {
    "Column1": "Judicious"
  },
  {
    "Column1": "Jack"
  },
  {
    "Column1": "Jacket"
  },
  {
    "Column1": "Jail"
  },
  {
    "Column1": "Jam"
  },
  {
    "Column1": "Jasmine"
  },
  {
    "Column1": "Jar"
  },
  {
    "Column1": "Job"
  },
  {
    "Column1": "Jog"
  },
  {
    "Column1": "Join"
  },
  {
    "Column1": "Joke"
  },
  {
    "Column1": "Journey"
  },
  {
    "Column1": "Judge"
  },
  {
    "Column1": "Juice"
  },
  {
    "Column1": "Jump"
  },
  {
    "Column1": "Junior"
  },
  {
    "Column1": "Just"
  },
  {
    "Column1": "Joy"
  },
  {
    "Column1": "Jewel"
  },
  {
    "Column1": "Jailor"
  },
  {
    "Column1": "Jolly"
  },
  {
    "Column1": "Jumping"
  },
  {
    "Column1": "Jumble"
  },
  {
    "Column1": "Judgment"
  },
  {
    "Column1": "Juggle"
  },
  {
    "Column1": "Joint"
  },
  {
    "Column1": "Jumbo"
  },
  {
    "Column1": "Jockey"
  },
  {
    "Column1": "Java"
  },
  {
    "Column1": "Jealous"
  },
  {
    "Column1": "Jew"
  },
  {
    "Column1": "Jangle"
  },
  {
    "Column1": "Jaunt"
  },
  {
    "Column1": "Junction"
  },
  {
    "Column1": "Junk"
  },
  {
    "Column1": "Jury"
  },
  {
    "Column1": "Jargon"
  },
  {
    "Column1": "Jogging"
  },
  {
    "Column1": "Jingle"
  },
  {
    "Column1": "Jigsaw"
  },
  {
    "Column1": "Jive"
  },
  {
    "Column1": "Jeer"
  },
  {
    "Column1": "Jostle"
  },
  {
    "Column1": "Jarring"
  },
  {
    "Column1": "Jeweler"
  },
  {
    "Column1": "Juxtapose"
  },
  {
    "Column1": "Jot"
  },
  {
    "Column1": "Jovial"
  },
  {
    "Column1": "Juicy"
  },
  {
    "Column1": "Jute"
  },
  {
    "Column1": "Jaunty"
  },
  {
    "Column1": "Jamboree"
  },
  {
    "Column1": "Jade"
  },
  {
    "Column1": "Javelin"
  },
  {
    "Column1": "Jubilee"
  },
  {
    "Column1": "Jazz"
  },
  {
    "Column1": "Jet"
  },
  {
    "Column1": "Jester"
  },
  {
    "Column1": "Journal"
  },
  {
    "Column1": "Janitor"
  },
  {
    "Column1": "Justify"
  },
  {
    "Column1": "Jackal"
  },
  {
    "Column1": "Juxtaposition"
  },
  {
    "Column1": "Jewels"
  },
  {
    "Column1": "Jittery"
  },
  {
    "Column1": "Jaded"
  },
  {
    "Column1": "Jest"
  },
  {
    "Column1": "Jarred"
  },
  {
    "Column1": "Jammed"
  },
  {
    "Column1": "Jetty"
  },
  {
    "Column1": "Jowly"
  },
  {
    "Column1": "Jointly"
  },
  {
    "Column1": "Jungle"
  },
  {
    "Column1": "Jotting"
  },
  {
    "Column1": "Jamb"
  },
  {
    "Column1": "Junkyard"
  },
  {
    "Column1": "Judicial"
  },
  {
    "Column1": "Jinx"
  },
  {
    "Column1": "Jock"
  },
  {
    "Column1": "Juxtaposed"
  },
  {
    "Column1": "Jazzed"
  },
  {
    "Column1": "Jangly"
  },
  {
    "Column1": "Jointed"
  },
  {
    "Column1": "Joyful"
  },
  {
    "Column1": "Jelly"
  },
  {
    "Column1": "Juiced"
  },
  {
    "Column1": "Jumpy"
  },
  {
    "Column1": "Jostling"
  },
  {
    "Column1": "Journalize"
  },
  {
    "Column1": "Joist"
  },
  {
    "Column1": "Jackknife"
  },
  {
    "Column1": "Junket"
  },
  {
    "Column1": "Jibber"
  },
  {
    "Column1": "Juju"
  },
  {
    "Column1": "Jammer"
  },
  {
    "Column1": "Juicer"
  },
  {
    "Column1": "Jockeying"
  },
  {
    "Column1": "Judicially"
  },
  {
    "Column1": "Jeopardized"
  },
  {
    "Column1": "Jargonistic"
  },
  {
    "Column1": "Judgmental"
  },
  {
    "Column1": "Jibber-jabber"
  },
  {
    "Column1": "Jealousy"
  },
  {
    "Column1": "Junkie"
  },
  {
    "Column1": "Jazzercise"
  },
  {
    "Column1": "Joviality"
  },
  {
    "Column1": "Jive-talking"
  },
  {
    "Column1": "Jewelry"
  },
  {
    "Column1": "K"
  },
  {
    "Column1": "Kick"
  },
  {
    "Column1": "Kindle"
  },
  {
    "Column1": "Kangaroo"
  },
  {
    "Column1": "Knife"
  },
  {
    "Column1": "Key"
  },
  {
    "Column1": "Kind"
  },
  {
    "Column1": "King"
  },
  {
    "Column1": "Knowledge"
  },
  {
    "Column1": "Keep"
  },
  {
    "Column1": "Kid"
  },
  {
    "Column1": "Kitchen"
  },
  {
    "Column1": "Kite"
  },
  {
    "Column1": "Knock"
  },
  {
    "Column1": "Knot"
  },
  {
    "Column1": "Kit"
  },
  {
    "Column1": "Keep calm"
  },
  {
    "Column1": "Kidnap"
  },
  {
    "Column1": "Kettle"
  },
  {
    "Column1": "Kiosk"
  },
  {
    "Column1": "Keyboard"
  },
  {
    "Column1": "Kindness"
  },
  {
    "Column1": "Kingdom"
  },
  {
    "Column1": "Kiss"
  },
  {
    "Column1": "Kettle bell"
  },
  {
    "Column1": "Knowledgeable"
  },
  {
    "Column1": "Knapsack"
  },
  {
    "Column1": "Kissing"
  },
  {
    "Column1": "Kitten"
  },
  {
    "Column1": "Keep fit"
  },
  {
    "Column1": "Keychain"
  },
  {
    "Column1": "Kicking"
  },
  {
    "Column1": "Kale"
  },
  {
    "Column1": "Ketchup"
  },
  {
    "Column1": "Kinky"
  },
  {
    "Column1": "Karma"
  },
  {
    "Column1": "Kiddo"
  },
  {
    "Column1": "Knives"
  },
  {
    "Column1": "Knowledge base"
  },
  {
    "Column1": "Kook"
  },
  {
    "Column1": "Kaleidoscope"
  },
  {
    "Column1": "Kingdom come"
  },
  {
    "Column1": "Kilter"
  },
  {
    "Column1": "Kelp"
  },
  {
    "Column1": "Knack"
  },
  {
    "Column1": "Kudos"
  },
  {
    "Column1": "Kissing booth"
  },
  {
    "Column1": "Kernel"
  },
  {
    "Column1": "Klutz"
  },
  {
    "Column1": "Kittenish"
  },
  {
    "Column1": "Kaleidoscopic"
  },
  {
    "Column1": "Kinesiology"
  },
  {
    "Column1": "Keynote"
  },
  {
    "Column1": "Kiln"
  },
  {
    "Column1": "Kidnapper"
  },
  {
    "Column1": "Killjoy"
  },
  {
    "Column1": "Kindred"
  },
  {
    "Column1": "Kismet"
  },
  {
    "Column1": "Knobby"
  },
  {
    "Column1": "Kink"
  },
  {
    "Column1": "Kickoff"
  },
  {
    "Column1": "Kettle drum"
  },
  {
    "Column1": "Kiwifruit"
  },
  {
    "Column1": "Kowtow"
  },
  {
    "Column1": "Knighthood"
  },
  {
    "Column1": "Krill"
  },
  {
    "Column1": "Koala"
  },
  {
    "Column1": "Kicking horse"
  },
  {
    "Column1": "Kill"
  },
  {
    "Column1": "Know"
  },
  {
    "Column1": "L"
  },
  {
    "Column1": "Lethargic"
  },
  {
    "Column1": "Lament"
  },
  {
    "Column1": "Lenient"
  },
  {
    "Column1": "Liable"
  },
  {
    "Column1": "Livid"
  },
  {
    "Column1": "Lofty"
  },
  {
    "Column1": "Loyalty"
  },
  {
    "Column1": "Lurk"
  },
  {
    "Column1": "Lukewarm"
  },
  {
    "Column1": "Luminous"
  },
  {
    "Column1": "Labor"
  },
  {
    "Column1": "Lady"
  },
  {
    "Column1": "Lake"
  },
  {
    "Column1": "Land"
  },
  {
    "Column1": "Language"
  },
  {
    "Column1": "Large"
  },
  {
    "Column1": "Last"
  },
  {
    "Column1": "Laugh"
  },
  {
    "Column1": "Leave"
  },
  {
    "Column1": "Leg"
  },
  {
    "Column1": "Letter"
  },
  {
    "Column1": "Life"
  },
  {
    "Column1": "Light"
  },
  {
    "Column1": "Like"
  },
  {
    "Column1": "List"
  },
  {
    "Column1": "Live"
  },
  {
    "Column1": "Long"
  },
  {
    "Column1": "Look"
  },
  {
    "Column1": "Lose"
  },
  {
    "Column1": "Love"
  },
  {
    "Column1": "Lunch"
  },
  {
    "Column1": "Lucky"
  },
  {
    "Column1": "Level"
  },
  {
    "Column1": "Lesson"
  },
  {
    "Column1": "Logic"
  },
  {
    "Column1": "Luxury"
  },
  {
    "Column1": "Leaf"
  },
  {
    "Column1": "Line"
  },
  {
    "Column1": "Lift"
  },
  {
    "Column1": "Link"
  },
  {
    "Column1": "Launch"
  },
  {
    "Column1": "Library"
  },
  {
    "Column1": "Lend"
  },
  {
    "Column1": "Limit"
  },
  {
    "Column1": "Local"
  },
  {
    "Column1": "Lamp"
  },
  {
    "Column1": "Laborer"
  },
  {
    "Column1": "Laughter"
  },
  {
    "Column1": "Listenable"
  },
  {
    "Column1": "Lifestyle"
  },
  {
    "Column1": "Lighter"
  },
  {
    "Column1": "Layout"
  },
  {
    "Column1": "Lean"
  },
  {
    "Column1": "Lovely"
  },
  {
    "Column1": "Lick"
  },
  {
    "Column1": "Leap"
  },
  {
    "Column1": "Lace"
  },
  {
    "Column1": "Lust"
  },
  {
    "Column1": "Lawyer"
  },
  {
    "Column1": "Leapfrog"
  },
  {
    "Column1": "Lollipop"
  },
  {
    "Column1": "Loyal"
  },
  {
    "Column1": "Lure"
  },
  {
    "Column1": "Lavish"
  },
  {
    "Column1": "Latch"
  },
  {
    "Column1": "Loyalist"
  },
  {
    "Column1": "Lullaby"
  },
  {
    "Column1": "Liquid"
  },
  {
    "Column1": "Ledger"
  },
  {
    "Column1": "Latitude"
  },
  {
    "Column1": "Legacy"
  },
  {
    "Column1": "Litter"
  },
  {
    "Column1": "Lethargy"
  },
  {
    "Column1": "Luggage"
  },
  {
    "Column1": "Loom"
  },
  {
    "Column1": "Lineage"
  },
  {
    "Column1": "Lamentation"
  },
  {
    "Column1": "Lagoon"
  },
  {
    "Column1": "Luminary"
  },
  {
    "Column1": "Luncheon"
  },
  {
    "Column1": "Legal"
  },
  {
    "Column1": "Lull"
  },
  {
    "Column1": "Lasso"
  },
  {
    "Column1": "Lattice"
  },
  {
    "Column1": "Latchkey"
  },
  {
    "Column1": "Lavatory"
  },
  {
    "Column1": "Leverage"
  },
  {
    "Column1": "Lonesome"
  },
  {
    "Column1": "Lacerate"
  },
  {
    "Column1": "Languid"
  },
  {
    "Column1": "Locale"
  },
  {
    "Column1": "Laminate"
  },
  {
    "Column1": "Lethal"
  },
  {
    "Column1": "Luster"
  },
  {
    "Column1": "Lateral"
  },
  {
    "Column1": "Lingering"
  },
  {
    "Column1": "Launchpad"
  },
  {
    "Column1": "Lavishness"
  },
  {
    "Column1": "Loquacious"
  },
  {
    "Column1": "Longing"
  },
  {
    "Column1": "Lumber"
  },
  {
    "Column1": "Lustrous"
  },
  {
    "Column1": "Legendary"
  },
  {
    "Column1": "Loll"
  },
  {
    "Column1": "Languish"
  },
  {
    "Column1": "Legalize"
  },
  {
    "Column1": "Locus"
  },
  {
    "Column1": "Leash"
  },
  {
    "Column1": "Laceration"
  },
  {
    "Column1": "Lactose"
  },
  {
    "Column1": "Luminosity"
  },
  {
    "Column1": "Listlessness"
  },
  {
    "Column1": "Longevity"
  },
  {
    "Column1": "Labyrinth"
  },
  {
    "Column1": "Lustfulness"
  },
  {
    "Column1": "Legitimacy"
  },
  {
    "Column1": "Lighthearted"
  },
  {
    "Column1": "Lightness"
  },
  {
    "Column1": "Lawful"
  },
  {
    "Column1": "Lethargically"
  },
  {
    "Column1": "Licentious"
  },
  {
    "Column1": "Labour"
  },
  {
    "Column1": "Ladder"
  },
  {
    "Column1": "Learn"
  },
  {
    "Column1": "Leaves"
  },
  {
    "Column1": "Listen"
  },
  {
    "Column1": "Lock"
  },
  {
    "Column1": "Look after"
  },
  {
    "Column1": "Lose patience"
  },
  {
    "Column1": "Lunatic"
  },
  {
    "Column1": "M"
  },
  {
    "Column1": "Madcap"
  },
  {
    "Column1": "Madden"
  },
  {
    "Column1": "Magazine"
  },
  {
    "Column1": "Magician"
  },
  {
    "Column1": "Magenta"
  },
  {
    "Column1": "Magnificent"
  },
  {
    "Column1": "Magnet"
  },
  {
    "Column1": "Magnify"
  },
  {
    "Column1": "Magnitude"
  },
  {
    "Column1": "Mail"
  },
  {
    "Column1": "Mainstream"
  },
  {
    "Column1": "Majestic"
  },
  {
    "Column1": "Make"
  },
  {
    "Column1": "Malady"
  },
  {
    "Column1": "Mammal"
  },
  {
    "Column1": "Mannequin"
  },
  {
    "Column1": "Manufacture"
  },
  {
    "Column1": "Manuscript"
  },
  {
    "Column1": "Marathon"
  },
  {
    "Column1": "Marvel"
  },
  {
    "Column1": "Machine"
  },
  {
    "Column1": "Magic"
  },
  {
    "Column1": "Man"
  },
  {
    "Column1": "Many"
  },
  {
    "Column1": "Map"
  },
  {
    "Column1": "Market"
  },
  {
    "Column1": "Mask"
  },
  {
    "Column1": "Matter"
  },
  {
    "Column1": "Meal"
  },
  {
    "Column1": "Mean"
  },
  {
    "Column1": "Measure"
  },
  {
    "Column1": "Medicine"
  },
  {
    "Column1": "Meet"
  },
  {
    "Column1": "Melt"
  },
  {
    "Column1": "Member"
  },
  {
    "Column1": "Memory"
  },
  {
    "Column1": "Men"
  },
  {
    "Column1": "Merry"
  },
  {
    "Column1": "Message"
  },
  {
    "Column1": "Method"
  },
  {
    "Column1": "Middle"
  },
  {
    "Column1": "Milk"
  },
  {
    "Column1": "Mind"
  },
  {
    "Column1": "Minute"
  },
  {
    "Column1": "Miss"
  },
  {
    "Column1": "Mix"
  },
  {
    "Column1": "Moment"
  },
  {
    "Column1": "Money"
  },
  {
    "Column1": "Month"
  },
  {
    "Column1": "More"
  },
  {
    "Column1": "Move"
  },
  {
    "Column1": "Mountain"
  },
  {
    "Column1": "Mouth"
  },
  {
    "Column1": "Mouse"
  },
  {
    "Column1": "Music"
  },
  {
    "Column1": "Must"
  },
  {
    "Column1": "Mysterious"
  },
  {
    "Column1": "Mindful"
  },
  {
    "Column1": "Maintain"
  },
  {
    "Column1": "Majority"
  },
  {
    "Column1": "Mechanism"
  },
  {
    "Column1": "Momentary"
  },
  {
    "Column1": "Medal"
  },
  {
    "Column1": "Monopoly"
  },
  {
    "Column1": "Mood"
  },
  {
    "Column1": "Mention"
  },
  {
    "Column1": "Moral"
  },
  {
    "Column1": "Model"
  },
  {
    "Column1": "Marketable"
  },
  {
    "Column1": "Motivation"
  },
  {
    "Column1": "Milestone"
  },
  {
    "Column1": "Module"
  },
  {
    "Column1": "Mediocre"
  },
  {
    "Column1": "Melodic"
  },
  {
    "Column1": "Mandatory"
  },
  {
    "Column1": "Martyr"
  },
  {
    "Column1": "Mischief"
  },
  {
    "Column1": "Miracle"
  },
  {
    "Column1": "Movement"
  },
  {
    "Column1": "Migrant"
  },
  {
    "Column1": "Memorandum"
  },
  {
    "Column1": "Majesty"
  },
  {
    "Column1": "Militant"
  },
  {
    "Column1": "Marvellous"
  },
  {
    "Column1": "Monitor"
  },
  {
    "Column1": "Masculine"
  },
  {
    "Column1": "Maturity"
  },
  {
    "Column1": "Multicultural"
  },
  {
    "Column1": "Material"
  },
  {
    "Column1": "Mythology"
  },
  {
    "Column1": "Mission"
  },
  {
    "Column1": "Mortality"
  },
  {
    "Column1": "Maintainability"
  },
  {
    "Column1": "Minimize"
  },
  {
    "Column1": "Mobility"
  },
  {
    "Column1": "Misinterpret"
  },
  {
    "Column1": "Methodology"
  },
  {
    "Column1": "Multitask"
  },
  {
    "Column1": "Marketplace"
  },
  {
    "Column1": "Monument"
  },
  {
    "Column1": "Mandate"
  },
  {
    "Column1": "Melancholy"
  },
  {
    "Column1": "Mobilization"
  },
  {
    "Column1": "Meditation"
  },
  {
    "Column1": "Mobilize"
  },
  {
    "Column1": "Minuscule"
  },
  {
    "Column1": "Multiply"
  },
  {
    "Column1": "Martyrdom"
  },
  {
    "Column1": "Mechanic"
  },
  {
    "Column1": "Murky"
  },
  {
    "Column1": "Machinist"
  },
  {
    "Column1": "Memento"
  },
  {
    "Column1": "Misshapen"
  },
  {
    "Column1": "Melodrama"
  },
  {
    "Column1": "Meditative"
  },
  {
    "Column1": "Muddle"
  },
  {
    "Column1": "Malevolent"
  },
  {
    "Column1": "Munificent"
  },
  {
    "Column1": "Methodical"
  },
  {
    "Column1": "Magnanimous"
  },
  {
    "Column1": "Mellow"
  },
  {
    "Column1": "Muse"
  },
  {
    "Column1": "Masked"
  },
  {
    "Column1": "Minotaur"
  },
  {
    "Column1": "Mildew"
  },
  {
    "Column1": "Matriarch"
  },
  {
    "Column1": "Mold"
  },
  {
    "Column1": "Microphone"
  },
  {
    "Column1": "Mushroom"
  },
  {
    "Column1": "Migrate"
  },
  {
    "Column1": "Mediate"
  },
  {
    "Column1": "Malicious"
  },
  {
    "Column1": "Mutant"
  },
  {
    "Column1": "Medallion"
  },
  {
    "Column1": "Mercurial"
  },
  {
    "Column1": "Melodious"
  },
  {
    "Column1": "Mainframe"
  },
  {
    "Column1": "Menu"
  },
  {
    "Column1": "Moth"
  },
  {
    "Column1": "Mortgage"
  },
  {
    "Column1": "Myth"
  },
  {
    "Column1": "Memoir"
  },
  {
    "Column1": "Mirth"
  },
  {
    "Column1": "Masterpiece"
  },
  {
    "Column1": "Mirthful"
  },
  {
    "Column1": "Misfit"
  },
  {
    "Column1": "Monarch"
  },
  {
    "Column1": "Microscopic"
  },
  {
    "Column1": "Matrix"
  },
  {
    "Column1": "Minutiae"
  },
  {
    "Column1": "Multiplicity"
  },
  {
    "Column1": "Mythical"
  },
  {
    "Column1": "Mercenary"
  },
  {
    "Column1": "Mortar"
  },
  {
    "Column1": "Metaphor"
  },
  {
    "Column1": "Monologue"
  },
  {
    "Column1": "Mortuary"
  },
  {
    "Column1": "Minivan"
  },
  {
    "Column1": "Mastery"
  },
  {
    "Column1": "Multitude"
  },
  {
    "Column1": "Medley"
  },
  {
    "Column1": "Memorial"
  },
  {
    "Column1": "Main gate"
  },
  {
    "Column1": "Manifestation"
  },
  {
    "Column1": "Marry"
  },
  {
    "Column1": "Medicines"
  },
  {
    "Column1": "Megalomaniac"
  },
  {
    "Column1": "Mew"
  },
  {
    "Column1": "Mischievous"
  },
  {
    "Column1": "Mobile"
  },
  {
    "Column1": "Moon"
  },
  {
    "Column1": "Morning"
  },
  {
    "Column1": "Mosque"
  },
  {
    "Column1": "N"
  },
  {
    "Column1": "Nacre"
  },
  {
    "Column1": "Nadir"
  },
  {
    "Column1": "Naive"
  },
  {
    "Column1": "Narrate"
  },
  {
    "Column1": "Nausea"
  },
  {
    "Column1": "Negligence"
  },
  {
    "Column1": "Negotiate"
  },
  {
    "Column1": "Niche"
  },
  {
    "Column1": "Nostalgia"
  },
  {
    "Column1": "Nourish"
  },
  {
    "Column1": "Novel"
  },
  {
    "Column1": "Nuance"
  },
  {
    "Column1": "Nutritious"
  },
  {
    "Column1": "Name"
  },
  {
    "Column1": "Nation"
  },
  {
    "Column1": "Nature"
  },
  {
    "Column1": "Near"
  },
  {
    "Column1": "Need"
  },
  {
    "Column1": "New"
  },
  {
    "Column1": "Nice"
  },
  {
    "Column1": "Night"
  },
  {
    "Column1": "Number"
  },
  {
    "Column1": "Note"
  },
  {
    "Column1": "Next"
  },
  {
    "Column1": "Now"
  },
  {
    "Column1": "Noon"
  },
  {
    "Column1": "Nothing"
  },
  {
    "Column1": "Never"
  },
  {
    "Column1": "Net"
  },
  {
    "Column1": "News"
  },
  {
    "Column1": "Nail"
  },
  {
    "Column1": "Neighbor"
  },
  {
    "Column1": "Normal"
  },
  {
    "Column1": "Notebook"
  },
  {
    "Column1": "Nutrient"
  },
  {
    "Column1": "Nerve"
  },
  {
    "Column1": "Notice"
  },
  {
    "Column1": "Noun"
  },
  {
    "Column1": "Narrative"
  },
  {
    "Column1": "Necessity"
  },
  {
    "Column1": "Navigate"
  },
  {
    "Column1": "Nurture"
  },
  {
    "Column1": "Neglect"
  },
  {
    "Column1": "Negotiation"
  },
  {
    "Column1": "Noble"
  },
  {
    "Column1": "Nostalgic"
  },
  {
    "Column1": "Nominate"
  },
  {
    "Column1": "Notify"
  },
  {
    "Column1": "Nuisance"
  },
  {
    "Column1": "Nurturing"
  },
  {
    "Column1": "Noisy"
  },
  {
    "Column1": "Notion"
  },
  {
    "Column1": "Nurtured"
  },
  {
    "Column1": "Nexus"
  },
  {
    "Column1": "Nomad"
  },
  {
    "Column1": "Nibble"
  },
  {
    "Column1": "Nurturance"
  },
  {
    "Column1": "Narrow"
  },
  {
    "Column1": "Nap"
  },
  {
    "Column1": "Nonstop"
  },
  {
    "Column1": "Nationwide"
  },
  {
    "Column1": "Network"
  },
  {
    "Column1": "Necessitate"
  },
  {
    "Column1": "Nitrogen"
  },
  {
    "Column1": "Nostalgically"
  },
  {
    "Column1": "Neon"
  },
  {
    "Column1": "Nutrition"
  },
  {
    "Column1": "Neutral"
  },
  {
    "Column1": "Navigable"
  },
  {
    "Column1": "Noteworthy"
  },
  {
    "Column1": "Nonviolent"
  },
  {
    "Column1": "Nominal"
  },
  {
    "Column1": "Nonprofit"
  },
  {
    "Column1": "Numeral"
  },
  {
    "Column1": "Nocturnal"
  },
  {
    "Column1": "Nudge"
  },
  {
    "Column1": "Nutritional"
  },
  {
    "Column1": "Noteable"
  },
  {
    "Column1": "Nonchalant"
  },
  {
    "Column1": "Nitpick"
  },
  {
    "Column1": "Neat"
  },
  {
    "Column1": "Native"
  },
  {
    "Column1": "Negation"
  },
  {
    "Column1": "Nanny"
  },
  {
    "Column1": "Neighbors"
  },
  {
    "Column1": "Nifty"
  },
  {
    "Column1": "Nurturer"
  },
  {
    "Column1": "Nicety"
  },
  {
    "Column1": "Nugget"
  },
  {
    "Column1": "Necessarily"
  },
  {
    "Column1": "Napkin"
  },
  {
    "Column1": "Nondescript"
  },
  {
    "Column1": "Nonchalantly"
  },
  {
    "Column1": "Noncommittal"
  },
  {
    "Column1": "Negligible"
  },
  {
    "Column1": "Nuisances"
  },
  {
    "Column1": "Notch"
  },
  {
    "Column1": "Neophyte"
  },
  {
    "Column1": "Nephrology"
  },
  {
    "Column1": "Numb"
  },
  {
    "Column1": "Neglectful"
  },
  {
    "Column1": "Newcomer"
  },
  {
    "Column1": "Numerology"
  },
  {
    "Column1": "Nonconformist"
  },
  {
    "Column1": "Narrowly"
  },
  {
    "Column1": "Newfound"
  },
  {
    "Column1": "Nimbly"
  },
  {
    "Column1": "Nominee"
  },
  {
    "Column1": "Nonexistent"
  },
  {
    "Column1": "Neutralize"
  },
  {
    "Column1": "Negativity"
  },
  {
    "Column1": "Nourishment"
  },
  {
    "Column1": "Notation"
  },
  {
    "Column1": "Nuanced"
  },
  {
    "Column1": "Notorious"
  },
  {
    "Column1": "Nominally"
  },
  {
    "Column1": "Notoriety"
  },
  {
    "Column1": "Notepad"
  },
  {
    "Column1": "Nautical"
  },
  {
    "Column1": "Navigational"
  },
  {
    "Column1": "Nonessential"
  },
  {
    "Column1": "Narrator"
  },
  {
    "Column1": "Nontraditional"
  },
  {
    "Column1": "Networked"
  },
  {
    "Column1": "Navigated"
  },
  {
    "Column1": "Neutrality"
  },
  {
    "Column1": "O"
  },
  {
    "Column1": "Oasis"
  },
  {
    "Column1": "Oblige"
  },
  {
    "Column1": "Obstacle"
  },
  {
    "Column1": "Obtain"
  },
  {
    "Column1": "Ocean"
  },
  {
    "Column1": "Odd"
  },
  {
    "Column1": "Offer"
  },
  {
    "Column1": "Oil"
  },
  {
    "Column1": "Okay"
  },
  {
    "Column1": "Old"
  },
  {
    "Column1": "Omit"
  },
  {
    "Column1": "On"
  },
  {
    "Column1": "Once"
  },
  {
    "Column1": "One"
  },
  {
    "Column1": "Only"
  },
  {
    "Column1": "Open"
  },
  {
    "Column1": "Opinion"
  },
  {
    "Column1": "Opportunity"
  },
  {
    "Column1": "Order"
  },
  {
    "Column1": "Organize"
  },
  {
    "Column1": "Other"
  },
  {
    "Column1": "Out"
  },
  {
    "Column1": "Overcome"
  },
  {
    "Column1": "Over"
  },
  {
    "Column1": "Own"
  },
  {
    "Column1": "Oar"
  },
  {
    "Column1": "Oath"
  },
  {
    "Column1": "Object"
  },
  {
    "Column1": "Observe"
  },
  {
    "Column1": "Occupy"
  },
  {
    "Column1": "Office"
  },
  {
    "Column1": "Official"
  },
  {
    "Column1": "Often"
  },
  {
    "Column1": "Operator"
  },
  {
    "Column1": "Opposite"
  },
  {
    "Column1": "Option"
  },
  {
    "Column1": "Ordinary"
  },
  {
    "Column1": "Organ"
  },
  {
    "Column1": "Organization"
  },
  {
    "Column1": "Origin"
  },
  {
    "Column1": "Original"
  },
  {
    "Column1": "Ornament"
  },
  {
    "Column1": "Outside"
  },
  {
    "Column1": "Overflow"
  },
  {
    "Column1": "Oversee"
  },
  {
    "Column1": "Overweight"
  },
  {
    "Column1": "Overjoyed"
  },
  {
    "Column1": "Overcast"
  },
  {
    "Column1": "Outreach"
  },
  {
    "Column1": "Outrage"
  },
  {
    "Column1": "Output"
  },
  {
    "Column1": "Outfit"
  },
  {
    "Column1": "Outing"
  },
  {
    "Column1": "Outline"
  },
  {
    "Column1": "Outlaw"
  },
  {
    "Column1": "Outsider"
  },
  {
    "Column1": "Outcome"
  },
  {
    "Column1": "Outnumber"
  },
  {
    "Column1": "Outdated"
  },
  {
    "Column1": "Outspoken"
  },
  {
    "Column1": "Outrageous"
  },
  {
    "Column1": "Outshine"
  },
  {
    "Column1": "Outskirts"
  },
  {
    "Column1": "Outpost"
  },
  {
    "Column1": "Outward"
  },
  {
    "Column1": "Outwardly"
  },
  {
    "Column1": "Oval"
  },
  {
    "Column1": "Overjoy"
  },
  {
    "Column1": "Ounce"
  },
  {
    "Column1": "Outburst"
  },
  {
    "Column1": "Outperform"
  },
  {
    "Column1": "Outsource"
  },
  {
    "Column1": "Overhead"
  },
  {
    "Column1": "Overload"
  },
  {
    "Column1": "Overwhelm"
  },
  {
    "Column1": "Overturn"
  },
  {
    "Column1": "Onward"
  },
  {
    "Column1": "Owner"
  },
  {
    "Column1": "Ongoing"
  },
  {
    "Column1": "Oligarchy"
  },
  {
    "Column1": "Opulent"
  },
  {
    "Column1": "Overlap"
  },
  {
    "Column1": "Outfitted"
  },
  {
    "Column1": "Optimal"
  },
  {
    "Column1": "Occupation"
  },
  {
    "Column1": "Ozone"
  },
  {
    "Column1": "Obligation"
  },
  {
    "Column1": "Observer"
  },
  {
    "Column1": "Obsession"
  },
  {
    "Column1": "Obliterate"
  },
  {
    "Column1": "Obtainable"
  },
  {
    "Column1": "Obtuse"
  },
  {
    "Column1": "Odyssey"
  },
  {
    "Column1": "Offensive"
  },
  {
    "Column1": "Officeholder"
  },
  {
    "Column1": "Offspring"
  },
  {
    "Column1": "Offline"
  },
  {
    "Column1": "Overt"
  },
  {
    "Column1": "Overestimate"
  },
  {
    "Column1": "Overpower"
  },
  {
    "Column1": "Overreact"
  },
  {
    "Column1": "Overture"
  },
  {
    "Column1": "Outstanding"
  },
  {
    "Column1": "Overrun"
  },
  {
    "Column1": "Overstep"
  },
  {
    "Column1": "Overlay"
  },
  {
    "Column1": "Outweigh"
  },
  {
    "Column1": "Overrule"
  },
  {
    "Column1": "Occur"
  },
  {
    "Column1": "Obvious"
  },
  {
    "Column1": "Objective"
  },
  {
    "Column1": "Obstruct"
  },
  {
    "Column1": "Odor"
  },
  {
    "Column1": "Offend"
  },
  {
    "Column1": "Offset"
  },
  {
    "Column1": "Omission"
  },
  {
    "Column1": "Omnipresent"
  },
  {
    "Column1": "Opine"
  },
  {
    "Column1": "Open-ended"
  },
  {
    "Column1": "Oppose"
  },
  {
    "Column1": "Optimum"
  },
  {
    "Column1": "Operate"
  },
  {
    "Column1": "Operative"
  },
  {
    "Column1": "Openness"
  },
  {
    "Column1": "Originator"
  },
  {
    "Column1": "Outcast"
  },
  {
    "Column1": "Overbearing"
  },
  {
    "Column1": "Overkill"
  },
  {
    "Column1": "Overland"
  },
  {
    "Column1": "Overlook"
  },
  {
    "Column1": "Overriding"
  },
  {
    "Column1": "Overwrite"
  },
  {
    "Column1": "Overzealous"
  },
  {
    "Column1": "Oxidize"
  },
  {
    "Column1": "Observant"
  },
  {
    "Column1": "Offhand"
  },
  {
    "Column1": "Onlooker"
  },
  {
    "Column1": "Outlay"
  },
  {
    "Column1": "Obey"
  },
  {
    "Column1": "Orange"
  },
  {
    "Column1": "P"
  },
  {
    "Column1": "Pace"
  },
  {
    "Column1": "Pack"
  },
  {
    "Column1": "Page"
  },
  {
    "Column1": "Pain"
  },
  {
    "Column1": "Paint"
  },
  {
    "Column1": "Palace"
  },
  {
    "Column1": "Pale"
  },
  {
    "Column1": "Panic"
  },
  {
    "Column1": "Paper"
  },
  {
    "Column1": "Parade"
  },
  {
    "Column1": "Pardon"
  },
  {
    "Column1": "Parent"
  },
  {
    "Column1": "Park"
  },
  {
    "Column1": "Party"
  },
  {
    "Column1": "Pass"
  },
  {
    "Column1": "Patient"
  },
  {
    "Column1": "Peace"
  },
  {
    "Column1": "People"
  },
  {
    "Column1": "Pepper"
  },
  {
    "Column1": "Perfect"
  },
  {
    "Column1": "Permit"
  },
  {
    "Column1": "Person"
  },
  {
    "Column1": "Phase"
  },
  {
    "Column1": "Photo"
  },
  {
    "Column1": "Piano"
  },
  {
    "Column1": "Pick"
  },
  {
    "Column1": "Picture"
  },
  {
    "Column1": "Piece"
  },
  {
    "Column1": "Pilot"
  },
  {
    "Column1": "Plan"
  },
  {
    "Column1": "Plant"
  },
  {
    "Column1": "Play"
  },
  {
    "Column1": "Please"
  },
  {
    "Column1": "Pocket"
  },
  {
    "Column1": "Pay"
  },
  {
    "Column1": "Perform"
  },
  {
    "Column1": "Place"
  },
  {
    "Column1": "Point"
  },
  {
    "Column1": "Poor"
  },
  {
    "Column1": "Power"
  },
  {
    "Column1": "Practice"
  },
  {
    "Column1": "Prepare"
  },
  {
    "Column1": "Present"
  },
  {
    "Column1": "Price"
  },
  {
    "Column1": "Print"
  },
  {
    "Column1": "Problem"
  },
  {
    "Column1": "Product"
  },
  {
    "Column1": "Program"
  },
  {
    "Column1": "Project"
  },
  {
    "Column1": "Promise"
  },
  {
    "Column1": "Protect"
  },
  {
    "Column1": "Proud"
  },
  {
    "Column1": "Provide"
  },
  {
    "Column1": "Public"
  },
  {
    "Column1": "Publish"
  },
  {
    "Column1": "Pull"
  },
  {
    "Column1": "Push"
  },
  {
    "Column1": "Puzzle"
  },
  {
    "Column1": "Peep"
  },
  {
    "Column1": "Pen"
  },
  {
    "Column1": "Pervasiveness"
  },
  {
    "Column1": "Phone"
  },
  {
    "Column1": "Pilgrim"
  },
  {
    "Column1": "Pillow"
  },
  {
    "Column1": "Pink"
  },
  {
    "Column1": "Plough"
  },
  {
    "Column1": "Pot"
  },
  {
    "Column1": "Pounce"
  },
  {
    "Column1": "Praise"
  },
  {
    "Column1": "Pray"
  },
  {
    "Column1": "Precise"
  },
  {
    "Column1": "Press"
  },
  {
    "Column1": "Pretend"
  },
  {
    "Column1": "Progress"
  },
  {
    "Column1": "Prudent"
  },
  {
    "Column1": "Punish"
  },
  {
    "Column1": "Put"
  },
  {
    "Column1": "Q"
  },
  {
    "Column1": "Quadroon"
  },
  {
    "Column1": "Quad"
  },
  {
    "Column1": "Quail"
  },
  {
    "Column1": "Qualify"
  },
  {
    "Column1": "Quandary"
  },
  {
    "Column1": "Quarantine"
  },
  {
    "Column1": "Quench"
  },
  {
    "Column1": "Query"
  },
  {
    "Column1": "Quest"
  },
  {
    "Column1": "Queue"
  },
  {
    "Column1": "Quick"
  },
  {
    "Column1": "Quid"
  },
  {
    "Column1": "Quiet"
  },
  {
    "Column1": "Quip"
  },
  {
    "Column1": "Quiver"
  },
  {
    "Column1": "Quota"
  },
  {
    "Column1": "Quote"
  },
  {
    "Column1": "Quality"
  },
  {
    "Column1": "Question"
  },
  {
    "Column1": "Quite"
  },
  {
    "Column1": "Queen"
  },
  {
    "Column1": "Quickness"
  },
  {
    "Column1": "Quirky"
  },
  {
    "Column1": "Quotation"
  },
  {
    "Column1": "Quarry"
  },
  {
    "Column1": "Quarters"
  },
  {
    "Column1": "Quiz"
  },
  {
    "Column1": "Quenchless"
  },
  {
    "Column1": "Quizzical"
  },
  {
    "Column1": "R"
  },
  {
    "Column1": "Raccoon"
  },
  {
    "Column1": "Race"
  },
  {
    "Column1": "Rain"
  },
  {
    "Column1": "Rainbow"
  },
  {
    "Column1": "Raise"
  },
  {
    "Column1": "Range"
  },
  {
    "Column1": "Rapid"
  },
  {
    "Column1": "Rare"
  },
  {
    "Column1": "Rat"
  },
  {
    "Column1": "Read"
  },
  {
    "Column1": "Ready"
  },
  {
    "Column1": "Real"
  },
  {
    "Column1": "Reason"
  },
  {
    "Column1": "Receive"
  },
  {
    "Column1": "Record"
  },
  {
    "Column1": "Red"
  },
  {
    "Column1": "Reflect"
  },
  {
    "Column1": "Refuse"
  },
  {
    "Column1": "Remember"
  },
  {
    "Column1": "Rent"
  },
  {
    "Column1": "Repeat"
  },
  {
    "Column1": "Reply"
  },
  {
    "Column1": "Rest"
  },
  {
    "Column1": "Result"
  },
  {
    "Column1": "Report"
  },
  {
    "Column1": "Return"
  },
  {
    "Column1": "Right"
  },
  {
    "Column1": "Risk"
  },
  {
    "Column1": "Room"
  },
  {
    "Column1": "Rose"
  },
  {
    "Column1": "Rule"
  },
  {
    "Column1": "Run"
  },
  {
    "Column1": "Ripe"
  },
  {
    "Column1": "Reach"
  },
  {
    "Column1": "Recognize"
  },
  {
    "Column1": "Remove"
  },
  {
    "Column1": "Repent"
  },
  {
    "Column1": "Request"
  },
  {
    "Column1": "Resign"
  },
  {
    "Column1": "Respect"
  },
  {
    "Column1": "Retire"
  },
  {
    "Column1": "Rice"
  },
  {
    "Column1": "Ring"
  },
  {
    "Column1": "River"
  },
  {
    "Column1": "Road"
  },
  {
    "Column1": "Ruin"
  },
  {
    "Column1": "Ruinous"
  },
  {
    "Column1": "S"
  },
  {
    "Column1": "Saccharine"
  },
  {
    "Column1": "Sacred"
  },
  {
    "Column1": "Sacrifice"
  },
  {
    "Column1": "Sadness"
  },
  {
    "Column1": "Safe"
  },
  {
    "Column1": "Salary"
  },
  {
    "Column1": "Sandal"
  },
  {
    "Column1": "Sandwich"
  },
  {
    "Column1": "Satisfy"
  },
  {
    "Column1": "Say"
  },
  {
    "Column1": "Scene"
  },
  {
    "Column1": "Science"
  },
  {
    "Column1": "Scissors"
  },
  {
    "Column1": "Scream"
  },
  {
    "Column1": "Sea"
  },
  {
    "Column1": "Search"
  },
  {
    "Column1": "Season"
  },
  {
    "Column1": "Secret"
  },
  {
    "Column1": "See"
  },
  {
    "Column1": "Seed"
  },
  {
    "Column1": "Selfish"
  },
  {
    "Column1": "Sentence"
  },
  {
    "Column1": "Separate"
  },
  {
    "Column1": "Serious"
  },
  {
    "Column1": "Servant"
  },
  {
    "Column1": "Set"
  },
  {
    "Column1": "Settle"
  },
  {
    "Column1": "Severe"
  },
  {
    "Column1": "Shadow"
  },
  {
    "Column1": "Shake"
  },
  {
    "Column1": "Shallow"
  },
  {
    "Column1": "Shame"
  },
  {
    "Column1": "Share"
  },
  {
    "Column1": "Sharp"
  },
  {
    "Column1": "Shelter"
  },
  {
    "Column1": "Shine"
  },
  {
    "Column1": "Ship"
  },
  {
    "Column1": "Shirt"
  },
  {
    "Column1": "Shock"
  },
  {
    "Column1": "Sad"
  },
  {
    "Column1": "Same"
  },
  {
    "Column1": "Satisfied"
  },
  {
    "Column1": "Save"
  },
  {
    "Column1": "School"
  },
  {
    "Column1": "Select"
  },
  {
    "Column1": "Sell"
  },
  {
    "Column1": "Send"
  },
  {
    "Column1": "Serve"
  },
  {
    "Column1": "Sew"
  },
  {
    "Column1": "Shave"
  },
  {
    "Column1": "Shop"
  },
  {
    "Column1": "Shout"
  },
  {
    "Column1": "Sing"
  },
  {
    "Column1": "Sky"
  },
  {
    "Column1": "Slave"
  },
  {
    "Column1": "Sleep"
  },
  {
    "Column1": "Slow"
  },
  {
    "Column1": "Small"
  },
  {
    "Column1": "Smile"
  },
  {
    "Column1": "Smoke"
  },
  {
    "Column1": "So"
  },
  {
    "Column1": "Soap"
  },
  {
    "Column1": "Sob"
  },
  {
    "Column1": "Solitary"
  },
  {
    "Column1": "Solve"
  },
  {
    "Column1": "Sorry"
  },
  {
    "Column1": "Speak"
  },
  {
    "Column1": "Spectacles"
  },
  {
    "Column1": "Spent"
  },
  {
    "Column1": "Spoil"
  },
  {
    "Column1": "Spoon"
  },
  {
    "Column1": "Stand"
  },
  {
    "Column1": "Star"
  },
  {
    "Column1": "Start"
  },
  {
    "Column1": "Starvation"
  },
  {
    "Column1": "Stay"
  },
  {
    "Column1": "Still"
  },
  {
    "Column1": "Stop"
  },
  {
    "Column1": "Struggle"
  },
  {
    "Column1": "Student"
  },
  {
    "Column1": "Study"
  },
  {
    "Column1": "Suffer"
  },
  {
    "Column1": "Sun"
  },
  {
    "Column1": "Superstition"
  },
  {
    "Column1": "Sweets"
  },
  {
    "Column1": "Swim"
  },
  {
    "Column1": "Swing"
  },
  {
    "Column1": "Sail"
  },
  {
    "Column1": "Sale"
  },
  {
    "Column1": "Salt"
  },
  {
    "Column1": "Sand"
  },
  {
    "Column1": "Shape"
  },
  {
    "Column1": "Short"
  },
  {
    "Column1": "Show"
  },
  {
    "Column1": "Shut"
  },
  {
    "Column1": "Simple"
  },
  {
    "Column1": "Sink"
  },
  {
    "Column1": "Sit"
  },
  {
    "Column1": "Size"
  },
  {
    "Column1": "Snow"
  },
  {
    "Column1": "Soak"
  },
  {
    "Column1": "Soft"
  },
  {
    "Column1": "Solid"
  },
  {
    "Column1": "South"
  },
  {
    "Column1": "Space"
  },
  {
    "Column1": "Special"
  },
  {
    "Column1": "Speed"
  },
  {
    "Column1": "Spend"
  },
  {
    "Column1": "Spirit"
  },
  {
    "Column1": "Spring"
  },
  {
    "Column1": "State"
  },
  {
    "Column1": "Step"
  },
  {
    "Column1": "Stock"
  },
  {
    "Column1": "Store"
  },
  {
    "Column1": "Storm"
  },
  {
    "Column1": "Style"
  },
  {
    "Column1": "Success"
  },
  {
    "Column1": "Such"
  },
  {
    "Column1": "Sudden"
  },
  {
    "Column1": "Summer"
  },
  {
    "Column1": "Support"
  },
  {
    "Column1": "Sure"
  },
  {
    "Column1": "Surface"
  },
  {
    "Column1": "Surprise"
  },
  {
    "Column1": "Sweet"
  },
  {
    "Column1": "Swift"
  },
  {
    "Column1": "System"
  },
  {
    "Column1": "Safety"
  },
  {
    "Column1": "Succeed"
  },
  {
    "Column1": "Suggest"
  },
  {
    "Column1": "Sorrow"
  },
  {
    "Column1": "Sincere"
  },
  {
    "Column1": "Scarcity"
  },
  {
    "Column1": "Strategy"
  },
  {
    "Column1": "Sample"
  },
  {
    "Column1": "Satisfaction"
  },
  {
    "Column1": "Supply"
  },
  {
    "Column1": "Secure"
  },
  {
    "Column1": "Signal"
  },
  {
    "Column1": "Suspend"
  },
  {
    "Column1": "Slope"
  },
  {
    "Column1": "Statement"
  },
  {
    "Column1": "Stocking"
  },
  {
    "Column1": "Section"
  },
  {
    "Column1": "Setup"
  },
  {
    "Column1": "Sibling"
  },
  {
    "Column1": "Sphere"
  },
  {
    "Column1": "Stubborn"
  },
  {
    "Column1": "Subscription"
  },
  {
    "Column1": "Statistics"
  },
  {
    "Column1": "Squeeze"
  },
  {
    "Column1": "Sanitation"
  },
  {
    "Column1": "Satellite"
  },
  {
    "Column1": "Silence"
  },
  {
    "Column1": "Slippery"
  },
  {
    "Column1": "Source"
  },
  {
    "Column1": "Showcase"
  },
  {
    "Column1": "Syllabus"
  },
  {
    "Column1": "Spontaneous"
  },
  {
    "Column1": "Synthesis"
  },
  {
    "Column1": "Stimulation"
  },
  {
    "Column1": "Spectacular"
  },
  {
    "Column1": "Scholarship"
  },
  {
    "Column1": "Storage"
  },
  {
    "Column1": "Snapshot"
  },
  {
    "Column1": "Situation"
  },
  {
    "Column1": "Subtract"
  },
  {
    "Column1": "Sufficient"
  },
  {
    "Column1": "Scenery"
  },
  {
    "Column1": "Simulation"
  },
  {
    "Column1": "Summarize"
  },
  {
    "Column1": "Saturation"
  },
  {
    "Column1": "Symmetry"
  },
  {
    "Column1": "Scandal"
  },
  {
    "Column1": "Syndrome"
  },
  {
    "Column1": "Scavenger"
  },
  {
    "Column1": "Suppress"
  },
  {
    "Column1": "Survive"
  },
  {
    "Column1": "Scold"
  },
  {
    "Column1": "Survey"
  },
  {
    "Column1": "Sustain"
  },
  {
    "Column1": "Surrender"
  },
  {
    "Column1": "Summit"
  },
  {
    "Column1": "Symbol"
  },
  {
    "Column1": "Scholar"
  },
  {
    "Column1": "Subsidy"
  },
  {
    "Column1": "Salute"
  },
  {
    "Column1": "Slogan"
  },
  {
    "Column1": "Scrutinize"
  },
  {
    "Column1": "Sprout"
  },
  {
    "Column1": "Scalable"
  },
  {
    "Column1": "Shortage"
  },
  {
    "Column1": "Shield"
  },
  {
    "Column1": "Substance"
  },
  {
    "Column1": "Stimulate"
  },
  {
    "Column1": "Synonym"
  },
  {
    "Column1": "T"
  },
  {
    "Column1": "Table"
  },
  {
    "Column1": "Talent"
  },
  {
    "Column1": "Talk"
  },
  {
    "Column1": "Tall"
  },
  {
    "Column1": "Tame"
  },
  {
    "Column1": "Taste"
  },
  {
    "Column1": "Tax"
  },
  {
    "Column1": "Teach"
  },
  {
    "Column1": "Tear"
  },
  {
    "Column1": "Tell"
  },
  {
    "Column1": "Temple"
  },
  {
    "Column1": "Tense"
  },
  {
    "Column1": "Thank"
  },
  {
    "Column1": "That"
  },
  {
    "Column1": "The"
  },
  {
    "Column1": "Their"
  },
  {
    "Column1": "Them"
  },
  {
    "Column1": "There"
  },
  {
    "Column1": "These"
  },
  {
    "Column1": "They"
  },
  {
    "Column1": "Think"
  },
  {
    "Column1": "Thing"
  },
  {
    "Column1": "This"
  },
  {
    "Column1": "Though"
  },
  {
    "Column1": "Thought"
  },
  {
    "Column1": "Thousand"
  },
  {
    "Column1": "Thread"
  },
  {
    "Column1": "Threat"
  },
  {
    "Column1": "Three"
  },
  {
    "Column1": "Through"
  },
  {
    "Column1": "Throw"
  },
  {
    "Column1": "Thus"
  },
  {
    "Column1": "Time"
  },
  {
    "Column1": "Tire"
  },
  {
    "Column1": "Title"
  },
  {
    "Column1": "To"
  },
  {
    "Column1": "Today"
  },
  {
    "Column1": "Tomorrow"
  },
  {
    "Column1": "Tongue"
  },
  {
    "Column1": "Tonight"
  },
  {
    "Column1": "Tool"
  },
  {
    "Column1": "Tooth"
  },
  {
    "Column1": "Top"
  },
  {
    "Column1": "Touch"
  },
  {
    "Column1": "Toward"
  },
  {
    "Column1": "Town"
  },
  {
    "Column1": "Train"
  },
  {
    "Column1": "Translate"
  },
  {
    "Column1": "Tree"
  },
  {
    "Column1": "Trouble"
  },
  {
    "Column1": "Truck"
  },
  {
    "Column1": "True"
  },
  {
    "Column1": "Take Meal"
  },
  {
    "Column1": "Take Medicine"
  },
  {
    "Column1": "Tap"
  },
  {
    "Column1": "Tea"
  },
  {
    "Column1": "Teacher"
  },
  {
    "Column1": "Tease"
  },
  {
    "Column1": "Thank You"
  },
  {
    "Column1": "Then"
  },
  {
    "Column1": "Threaten"
  },
  {
    "Column1": "Thrifty"
  },
  {
    "Column1": "Thunder"
  },
  {
    "Column1": "Tough"
  },
  {
    "Column1": "Towel"
  },
  {
    "Column1": "Treat"
  },
  {
    "Column1": "Try"
  },
  {
    "Column1": "Take"
  },
  {
    "Column1": "Team"
  },
  {
    "Column1": "Test"
  },
  {
    "Column1": "Together"
  },
  {
    "Column1": "Too"
  },
  {
    "Column1": "Travel"
  },
  {
    "Column1": "Turn"
  },
  {
    "Column1": "Type"
  },
  {
    "Column1": "Total"
  },
  {
    "Column1": "Trade"
  },
  {
    "Column1": "Task"
  },
  {
    "Column1": "Television"
  },
  {
    "Column1": "Temperature"
  },
  {
    "Column1": "Technique"
  },
  {
    "Column1": "Ticket"
  },
  {
    "Column1": "Tradition"
  },
  {
    "Column1": "Treasure"
  },
  {
    "Column1": "Tunnel"
  },
  {
    "Column1": "Tablet"
  },
  {
    "Column1": "Territory"
  },
  {
    "Column1": "Theory"
  },
  {
    "Column1": "Timeline"
  },
  {
    "Column1": "Theater"
  },
  {
    "Column1": "Tragedy"
  },
  {
    "Column1": "Traffic"
  },
  {
    "Column1": "Transaction"
  },
  {
    "Column1": "Transform"
  },
  {
    "Column1": "Transparent"
  },
  {
    "Column1": "Trust"
  },
  {
    "Column1": "Truth"
  },
  {
    "Column1": "Tutor"
  },
  {
    "Column1": "Triumph"
  },
  {
    "Column1": "Target"
  },
  {
    "Column1": "Technology"
  },
  {
    "Column1": "Temptation"
  },
  {
    "Column1": "Thesis"
  },
  {
    "Column1": "Theme"
  },
  {
    "Column1": "Tone"
  },
  {
    "Column1": "Tray"
  },
  {
    "Column1": "Trend"
  },
  {
    "Column1": "Tribute"
  },
  {
    "Column1": "Trophy"
  },
  {
    "Column1": "Twist"
  },
  {
    "Column1": "Token"
  },
  {
    "Column1": "Text"
  },
  {
    "Column1": "Throttle"
  },
  {
    "Column1": "Tropical"
  },
  {
    "Column1": "Transport"
  },
  {
    "Column1": "Trampoline"
  },
  {
    "Column1": "Trait"
  },
  {
    "Column1": "Tolerance"
  },
  {
    "Column1": "Toll"
  },
  {
    "Column1": "Term"
  },
  {
    "Column1": "Template"
  },
  {
    "Column1": "Telescope"
  },
  {
    "Column1": "Tactic"
  },
  {
    "Column1": "Thumb"
  },
  {
    "Column1": "Tilt"
  },
  {
    "Column1": "Treatment"
  },
  {
    "Column1": "Tub"
  },
  {
    "Column1": "Texture"
  },
  {
    "Column1": "Textbook"
  },
  {
    "Column1": "Tank"
  },
  {
    "Column1": "Tidy"
  },
  {
    "Column1": "Timeless"
  },
  {
    "Column1": "Transition"
  },
  {
    "Column1": "Trip"
  },
  {
    "Column1": "Tune"
  },
  {
    "Column1": "Twinkle"
  },
  {
    "Column1": "Turtle"
  },
  {
    "Column1": "Taboo"
  },
  {
    "Column1": "Trial"
  },
  {
    "Column1": "Tension"
  },
  {
    "Column1": "Terror"
  },
  {
    "Column1": "Trim"
  },
  {
    "Column1": "Turf"
  },
  {
    "Column1": "Tally"
  },
  {
    "Column1": "Toffee"
  },
  {
    "Column1": "Thimble"
  },
  {
    "Column1": "Tumult"
  },
  {
    "Column1": "Thrill"
  },
  {
    "Column1": "Throb"
  },
  {
    "Column1": "Trot"
  },
  {
    "Column1": "Tangle"
  },
  {
    "Column1": "Tedious"
  },
  {
    "Column1": "Tidbit"
  },
  {
    "Column1": "Thump"
  },
  {
    "Column1": "Thistle"
  },
  {
    "Column1": "Tack"
  },
  {
    "Column1": "Tattle"
  },
  {
    "Column1": "Tingle"
  },
  {
    "Column1": "Tango"
  },
  {
    "Column1": "Thicket"
  },
  {
    "Column1": "Toxin"
  },
  {
    "Column1": "Testimony"
  },
  {
    "Column1": "U"
  },
  {
    "Column1": "Umbrella"
  },
  {
    "Column1": "Unable"
  },
  {
    "Column1": "Unanimous"
  },
  {
    "Column1": "Unbendable"
  },
  {
    "Column1": "Uncertain"
  },
  {
    "Column1": "Uncle"
  },
  {
    "Column1": "Unconditional"
  },
  {
    "Column1": "Unconscious"
  },
  {
    "Column1": "Under"
  },
  {
    "Column1": "Understand"
  },
  {
    "Column1": "Unexpected"
  },
  {
    "Column1": "Unfair"
  },
  {
    "Column1": "Unfinished"
  },
  {
    "Column1": "Ungrateful"
  },
  {
    "Column1": "Unique"
  },
  {
    "Column1": "Universal"
  },
  {
    "Column1": "Unpleasant"
  },
  {
    "Column1": "Unlock"
  },
  {
    "Column1": "Unnecessary"
  },
  {
    "Column1": "Upset"
  },
  {
    "Column1": "Unpretentious"
  },
  {
    "Column1": "Up"
  },
  {
    "Column1": "Use"
  },
  {
    "Column1": "University"
  },
  {
    "Column1": "Uniform"
  },
  {
    "Column1": "Unhappy"
  },
  {
    "Column1": "Until"
  },
  {
    "Column1": "Upload"
  },
  {
    "Column1": "Urban"
  },
  {
    "Column1": "Useful"
  },
  {
    "Column1": "Usual"
  },
  {
    "Column1": "Utensil"
  },
  {
    "Column1": "Utter"
  },
  {
    "Column1": "Ultimate"
  },
  {
    "Column1": "Uplift"
  },
  {
    "Column1": "Urgent"
  },
  {
    "Column1": "Unfortunate"
  },
  {
    "Column1": "Uncommon"
  },
  {
    "Column1": "Unwilling"
  },
  {
    "Column1": "Unfold"
  },
  {
    "Column1": "Uproar"
  },
  {
    "Column1": "Unify"
  },
  {
    "Column1": "Unveil"
  },
  {
    "Column1": "Useless"
  },
  {
    "Column1": "Unusual"
  },
  {
    "Column1": "Uncover"
  },
  {
    "Column1": "Unbreakable"
  },
  {
    "Column1": "Untidy"
  },
  {
    "Column1": "Unwanted"
  },
  {
    "Column1": "Untouched"
  },
  {
    "Column1": "Unpredictable"
  },
  {
    "Column1": "Unstable"
  },
  {
    "Column1": "Unlikely"
  },
  {
    "Column1": "Upbeat"
  },
  {
    "Column1": "Uproarious"
  },
  {
    "Column1": "Unconventional"
  },
  {
    "Column1": "Underline"
  },
  {
    "Column1": "Unwind"
  },
  {
    "Column1": "Urge"
  },
  {
    "Column1": "Unrestrained"
  },
  {
    "Column1": "Unfolding"
  },
  {
    "Column1": "Utterly"
  },
  {
    "Column1": "Uplifting"
  },
  {
    "Column1": "Unreliable"
  },
  {
    "Column1": "Unintended"
  },
  {
    "Column1": "Unwelcome"
  },
  {
    "Column1": "Undeniable"
  },
  {
    "Column1": "Underneath"
  },
  {
    "Column1": "Unthinkable"
  },
  {
    "Column1": "Untangle"
  },
  {
    "Column1": "Underdog"
  },
  {
    "Column1": "Unused"
  },
  {
    "Column1": "Uphold"
  },
  {
    "Column1": "Unfamiliar"
  },
  {
    "Column1": "Unchanged"
  },
  {
    "Column1": "Unceasing"
  },
  {
    "Column1": "Uncertainty"
  },
  {
    "Column1": "Uncontrolled"
  },
  {
    "Column1": "Underestimate"
  },
  {
    "Column1": "Underprivileged"
  },
  {
    "Column1": "Undisputed"
  },
  {
    "Column1": "Unbearable"
  },
  {
    "Column1": "Unnatural"
  },
  {
    "Column1": "Untamed"
  },
  {
    "Column1": "Unfurl"
  },
  {
    "Column1": "Unravel"
  },
  {
    "Column1": "Uneven"
  },
  {
    "Column1": "Unearth"
  },
  {
    "Column1": "Unplug"
  },
  {
    "Column1": "Unimaginable"
  },
  {
    "Column1": "Unapproachable"
  },
  {
    "Column1": "Uninhabited"
  },
  {
    "Column1": "Unshakeable"
  },
  {
    "Column1": "Unquestionable"
  },
  {
    "Column1": "Unrehearsed"
  },
  {
    "Column1": "Unmistakable"
  },
  {
    "Column1": "Uncomplicated"
  },
  {
    "Column1": "Unbiased"
  },
  {
    "Column1": "Uninhabitable"
  },
  {
    "Column1": "V"
  },
  {
    "Column1": "Vacant"
  },
  {
    "Column1": "Vacuum"
  },
  {
    "Column1": "Vain"
  },
  {
    "Column1": "Valid"
  },
  {
    "Column1": "Valley"
  },
  {
    "Column1": "Valuable"
  },
  {
    "Column1": "Vanish"
  },
  {
    "Column1": "Variety"
  },
  {
    "Column1": "Vast"
  },
  {
    "Column1": "Vegetable"
  },
  {
    "Column1": "Vehicle"
  },
  {
    "Column1": "Velocity"
  },
  {
    "Column1": "Venom"
  },
  {
    "Column1": "Venture"
  },
  {
    "Column1": "Verse"
  },
  {
    "Column1": "Vertical"
  },
  {
    "Column1": "Veteran"
  },
  {
    "Column1": "Victim"
  },
  {
    "Column1": "Victory"
  },
  {
    "Column1": "View"
  },
  {
    "Column1": "Vacillate"
  },
  {
    "Column1": "Vegetables"
  },
  {
    "Column1": "Veneration"
  },
  {
    "Column1": "Vessels"
  },
  {
    "Column1": "Vex"
  },
  {
    "Column1": "Value"
  },
  {
    "Column1": "Visit"
  },
  {
    "Column1": "Voice"
  },
  {
    "Column1": "Very"
  },
  {
    "Column1": "Vary"
  },
  {
    "Column1": "Vow"
  },
  {
    "Column1": "Validate"
  },
  {
    "Column1": "Vivid"
  },
  {
    "Column1": "Volunteer"
  },
  {
    "Column1": "Vital"
  },
  {
    "Column1": "Visual"
  },
  {
    "Column1": "Vote"
  },
  {
    "Column1": "Vantage"
  },
  {
    "Column1": "Vanity"
  },
  {
    "Column1": "Vortex"
  },
  {
    "Column1": "Vibration"
  },
  {
    "Column1": "Vibrant"
  },
  {
    "Column1": "Van"
  },
  {
    "Column1": "Viscous"
  },
  {
    "Column1": "Vest"
  },
  {
    "Column1": "Vouch"
  },
  {
    "Column1": "Villain"
  },
  {
    "Column1": "Visor"
  },
  {
    "Column1": "Vengeance"
  },
  {
    "Column1": "Vision"
  },
  {
    "Column1": "Vagueness"
  },
  {
    "Column1": "Vintage"
  },
  {
    "Column1": "Vitality"
  },
  {
    "Column1": "Vastness"
  },
  {
    "Column1": "Vise"
  },
  {
    "Column1": "Valet"
  },
  {
    "Column1": "Vividly"
  },
  {
    "Column1": "Varnish"
  },
  {
    "Column1": "Vandalism"
  },
  {
    "Column1": "Vocation"
  },
  {
    "Column1": "Voluntary"
  },
  {
    "Column1": "Valuation"
  },
  {
    "Column1": "Variance"
  },
  {
    "Column1": "Vestige"
  },
  {
    "Column1": "Vulnerable"
  },
  {
    "Column1": "Varnished"
  },
  {
    "Column1": "Violent"
  },
  {
    "Column1": "Void"
  },
  {
    "Column1": "Vocal"
  },
  {
    "Column1": "Viscosity"
  },
  {
    "Column1": "Veracity"
  },
  {
    "Column1": "Vigilance"
  },
  {
    "Column1": "Villager"
  },
  {
    "Column1": "Viscid"
  },
  {
    "Column1": "Viable"
  },
  {
    "Column1": "Vanguard"
  },
  {
    "Column1": "Vacation"
  },
  {
    "Column1": "Valiant"
  },
  {
    "Column1": "Violation"
  },
  {
    "Column1": "Vaccine"
  },
  {
    "Column1": "Voucher"
  },
  {
    "Column1": "Vibrate"
  },
  {
    "Column1": "Villainy"
  },
  {
    "Column1": "Vapor"
  },
  {
    "Column1": "Viceroy"
  },
  {
    "Column1": "Visage"
  },
  {
    "Column1": "Valued"
  },
  {
    "Column1": "Vocabulary"
  },
  {
    "Column1": "Vividness"
  },
  {
    "Column1": "Verdict"
  },
  {
    "Column1": "Viability"
  },
  {
    "Column1": "Veil"
  },
  {
    "Column1": "W"
  },
  {
    "Column1": "Wag"
  },
  {
    "Column1": "Wait"
  },
  {
    "Column1": "Wake"
  },
  {
    "Column1": "Walk"
  },
  {
    "Column1": "Wall"
  },
  {
    "Column1": "Wander"
  },
  {
    "Column1": "Want"
  },
  {
    "Column1": "Warm"
  },
  {
    "Column1": "Warn"
  },
  {
    "Column1": "Wash"
  },
  {
    "Column1": "Waste"
  },
  {
    "Column1": "Watch"
  },
  {
    "Column1": "Water"
  },
  {
    "Column1": "Wave"
  },
  {
    "Column1": "Way"
  },
  {
    "Column1": "Weak"
  },
  {
    "Column1": "Wear"
  },
  {
    "Column1": "Weather"
  },
  {
    "Column1": "Weed"
  },
  {
    "Column1": "Weep"
  },
  {
    "Column1": "Well"
  },
  {
    "Column1": "What"
  },
  {
    "Column1": "When"
  },
  {
    "Column1": "Where"
  },
  {
    "Column1": "Whether"
  },
  {
    "Column1": "Which"
  },
  {
    "Column1": "While"
  },
  {
    "Column1": "Whisper"
  },
  {
    "Column1": "White"
  },
  {
    "Column1": "Who"
  },
  {
    "Column1": "Why"
  },
  {
    "Column1": "Wide"
  },
  {
    "Column1": "Wife"
  },
  {
    "Column1": "Win"
  },
  {
    "Column1": "Wind"
  },
  {
    "Column1": "Window"
  },
  {
    "Column1": "Wing"
  },
  {
    "Column1": "Winter"
  },
  {
    "Column1": "Wire"
  },
  {
    "Column1": "Wise"
  },
  {
    "Column1": "Wish"
  },
  {
    "Column1": "Witch"
  },
  {
    "Column1": "Witness"
  },
  {
    "Column1": "Won"
  },
  {
    "Column1": "Wood"
  },
  {
    "Column1": "Week"
  },
  {
    "Column1": "Weigh"
  },
  {
    "Column1": "Wheat"
  },
  {
    "Column1": "Wheel"
  },
  {
    "Column1": "Whishper"
  },
  {
    "Column1": "Winsome"
  },
  {
    "Column1": "Work"
  },
  {
    "Column1": "Worth"
  },
  {
    "Column1": "Would"
  },
  {
    "Column1": "Write"
  },
  {
    "Column1": "Word"
  },
  {
    "Column1": "Welcome"
  },
  {
    "Column1": "Wonderful"
  },
  {
    "Column1": "World"
  },
  {
    "Column1": "Worry"
  },
  {
    "Column1": "Weight"
  },
  {
    "Column1": "Winner"
  },
  {
    "Column1": "Walkway"
  },
  {
    "Column1": "Wild"
  },
  {
    "Column1": "X"
  },
  {
    "Column1": "X-ray"
  },
  {
    "Column1": "Xenophobia"
  },
  {
    "Column1": "Xylophone"
  },
  {
    "Column1": "X-axis"
  },
  {
    "Column1": "X-coordinate"
  },
  {
    "Column1": "Xerox"
  },
  {
    "Column1": "X-factor"
  },
  {
    "Column1": "X-rated"
  },
  {
    "Column1": "Xenomorph"
  },
  {
    "Column1": "Xylophonist"
  },
  {
    "Column1": "Y"
  },
  {
    "Column1": "Year"
  },
  {
    "Column1": "Yellow"
  },
  {
    "Column1": "Yes"
  },
  {
    "Column1": "Yesterday"
  },
  {
    "Column1": "Your"
  },
  {
    "Column1": "Year"
  },
  {
    "Column1": "Yellow"
  },
  {
    "Column1": "You"
  },
  {
    "Column1": "Young"
  },
  {
    "Column1": "Your"
  },
  {
    "Column1": "Yet"
  },
  {
    "Column1": "Yield"
  },
  {
    "Column1": "Yawn"
  },
  {
    "Column1": "Yacht"
  },
  {
    "Column1": "Yard"
  },
  {
    "Column1": "Yummy"
  },
  {
    "Column1": "Youth"
  },
  {
    "Column1": "Yoga"
  },
  {
    "Column1": "Yoke"
  },
  {
    "Column1": "Yummy"
  },
  {
    "Column1": "Yearn"
  },
  {
    "Column1": "Yonder"
  },
  {
    "Column1": "Yell"
  },
  {
    "Column1": "Z"
  },
  {
    "Column1": "Zero"
  },
  {
    "Column1": "Zebra"
  },
  {
    "Column1": "Zen"
  },
  {
    "Column1": "Zip"
  },
  {
    "Column1": "Zone"
  },
  {
    "Column1": "Zoom"
  },
  {
    "Column1": "Zest"
  },
  {
    "Column1": "Zeal"
  },
  {
    "Column1": "Zigzag"
  },
  {
    "Column1": "Zipper"
  },
  {
    "Column1": "Zucchini"
  },
  {
    "Column1": "Zany"
  },
  {
    "Column1": "Zephyr"
  },
  {
    "Column1": "Zenith"
  },
  {
    "Column1": "Zillion"
  },
  {
    "Column1": "Zesty"
  },
  {
    "Column1": "Zombie"
  },
  {
    "Column1": "Zing"
  },
  {
    "Column1": "Zestful"
  },
  {
    "Column1": "Zany"
  }
];

export default function NeuralConquestHub() {
  const [index, setIndex] = useState(0);
  const [conqueredCount, setConqueredCount] = useState(0);
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explanationMode, setExplanationMode] = useState("EN");
  const [isSearching, setIsSearching] = useState(false);

  const fetchNeuralData = useCallback(async (word, fromSearch = false) => {
    if (!word || word.trim().length <= 1) {
      if (!fromSearch) setIndex((prev) => prev + 1);
      return;
    }
    setLoading(true);
    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);
      if (!dictRes.ok) {
        toast.error(`NOT_FOUND: ${word.trim().toUpperCase()}`, {
          style: { background: '#0a0a0c', color: '#ff4b4b', border: '1px solid #ff4b4b20', borderRadius: '8px', fontSize: '10px' }
        });
        if (fromSearch) {
          setIsSearching(false);
          const originalWord = vocabList[index]?.Column1;
          if (originalWord) fetchNeuralData(originalWord, false);
        } else {
          setIndex(prev => prev + 1);
        }
        return;
      }
      const dictData = await dictRes.json();
      const definition = dictData[0].meanings[0].definitions[0].definition;
      const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${word.trim()}&langpair=en|hi`);
      const transData = await transRes.json();
      const fullTransRes = await fetch(`https://api.mymemory.translated.net/get?q=${definition.substring(0, 450)}&langpair=en|hi`);
      const fullTransData = await fullTransRes.json();
      
      setData({
        word: word.trim(),
        hindi: transData.responseData?.translatedText || "N/A",
        explanationEN: definition,
        explanationHI: fullTransData.responseData?.translatedText || "Syncing...",
      });
      setExplanationMode("EN");
    } catch (err) {
      toast.error("LINK_LOST");
      setIsSearching(false);
    } finally {
      setLoading(false);
    }
  }, [index, isSearching]);

  useEffect(() => {
    if (!isSearching && vocabList[index]) {
      fetchNeuralData(vocabList[index].Column1, false);
    }
  }, [index, fetchNeuralData, isSearching]);

  const handleVote = (voteType) => {
    setConqueredCount(prev => prev + 1);
    setTimeout(() => {
      if (isSearching) setIsSearching(false);
      else if (index < vocabList.length - 1) setIndex(prev => prev + 1);
    }, 400);
  };

  const speak = (txt) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'en-US'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center p-4 font-sans overflow-hidden">
      <Toaster position="top-center" />

      {/* 🚀 HEADER */}
      <div className="w-full max-w-[420px] mt-2 mb-6 bg-white/[0.02] border border-white/5 p-4 rounded-xl flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
            <Trophy size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">Mastery_Progress</p>
            <p className="text-lg font-black italic text-blue-500 leading-none">
              {conqueredCount}<span className="text-gray-700 text-xs font-bold"> / {vocabList.length}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase">Lvl_{Math.floor(conqueredCount/10) + 1}</span>
        </div>
      </div>

      {/* 🔍 SEARCH */}
      <div className="w-full max-w-[420px] mb-8 relative">
        <input 
          type="text" 
          placeholder="ENTER_WORD_TO_SCAN" 
          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-4 px-6 text-[11px] font-bold tracking-widest outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700 uppercase"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && query.trim() && (setIsSearching(true), fetchNeuralData(query, true), setQuery(""))}
        />
        <Search className="absolute right-5 top-4 text-gray-800" size={16} />
      </div>

      {/* 📦 CARD DECK */}
      <div className="relative w-full max-w-[420px] h-[520px]">
        <AnimatePresence mode="wait">
          {loading || !data ? (
            <motion.div key="loader" className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0f] border border-white/5 rounded-2xl">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 mt-4">Syncing_Vault</p>
            </motion.div>
          ) : (
            <motion.div
              key={data.word}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-[#0d0d0f] border border-white/10 rounded-2xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-7">
                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                  <button onClick={() => speak(data.word)} className="p-3 bg-white/5 rounded-lg text-blue-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                     <Volume2 size={20} />
                  </button>
                  <button 
                    onClick={() => setExplanationMode(prev => prev === "EN" ? "HI" : "EN")}
                    className={`px-4 py-2 rounded-lg border font-black text-[10px] tracking-widest transition-all ${explanationMode === "HI" ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" : "bg-white/5 border-white/10 text-gray-500"}`}
                  >
                    {explanationMode}_MODE
                  </button>
                </div>

                {/* 🔥 FIXED: AUTO-SHRINKING TEXT SECTION */}
                <div className="space-y-4 overflow-hidden">
                  <div className="w-full flex items-center min-h-[60px]">
                    <h1 
                      className="font-[1000] uppercase italic tracking-tighter leading-none whitespace-nowrap origin-left transition-all duration-300"
                      style={{
                        // Clamp handle karega standard size, container control karega shrink
                        fontSize: 'clamp(2rem, 15vw, 3.75rem)',
                        viewTransitionName: 'word-shrink'
                      }}
                    >
                      {data.word}
                    </h1>
                  </div>
                  <div className="inline-block bg-yellow-400 text-black px-5 py-1.5 rounded-lg font-black text-xl italic tracking-tight">
                     {data.hindi}
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl min-h-[140px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/30"></div>
                  <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.3em] block mb-3 italic">Neural_Analysis</span>
                  <p className="text-[15px] text-gray-300 leading-relaxed font-medium italic">
                    "{explanationMode === "EN" ? data.explanationEN : data.explanationHI}"
                  </p>
                </div>
              </div>

              {/* SLIM PROGRESS */}
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-6">
                 <div className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: `${((index + 1) / vocabList.length) * 100}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ⚡ ACTION BUTTONS */}
      <div className={`mt-8 grid grid-cols-3 gap-3 w-full max-w-[420px] transition-all duration-300 ${data ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
        {[
          { label: 'NEW', icon: XCircle, color: 'text-red-500', key: 'New' },
          { label: 'HEARD', icon: Star, color: 'text-blue-500', key: 'Heard' },
          { label: 'DAILY', icon: Zap, color: 'text-green-500', key: 'Daily' }
        ].map((btn) => (
          <button 
            key={btn.key} 
            onClick={() => handleVote(btn.key)} 
            className="flex flex-col items-center gap-2 py-5 bg-[#0a0a0c] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-all active:scale-95 group"
          >
            <btn.icon size={22} className={`${btn.color} opacity-40 group-hover:opacity-100 transition-all`} />
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-white">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}