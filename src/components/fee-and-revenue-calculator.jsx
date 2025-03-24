import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

export default function FeeAndRevenueCalculator() {
  
  const [showProgramToggle, setShowProgramToggle] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [makerVolume, setMakerVolume] = useState("");
  const [takerVolume, setTakerVolume] = useState("");
  const [tradingVolume, setTradingVolume] = useState("");
  const [usePercentage, setUsePercentage] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [programmaticTier, setprogrammaticTier] = useState("VIP5");
  const [results, setResults] = useState(null);

  const feeStructure = {
    USD: {
      VIP1: { maker: 0.045, taker: 0.05, volume: "$5M - $10M" },
      VIP2: { maker: 0.04, taker: 0.045, volume: "$10M - $20M" },
      VIP3: { maker: 0.03, taker: 0.04, volume: "$20M - $100M" },
      VIP4: { maker: 0.02, taker: 0.035, volume: "$100M - $200M" },
      VIP5: { maker: 0.0, taker: 0.03, volume: "$200M - $500M" },
      VIP6: { maker: -0.002, taker: 0.025, volume: "$500M - $1B" },
      VIP7: { maker: -0.005, taker: 0.02, volume: "$1B - $5B" },
      VIP8: { maker: -0.005, taker: 0.015, volume: "> $5B" },
    },
    EUR: {
      VIP1: { maker: 0.07, taker: 0.095, volume: "€100K – €250K" },
      VIP2: { maker: 0.06, taker: 0.09, volume: "€250K - €500K" },
      VIP3: { maker: 0.05, taker: 0.08, volume: "€500K - €2.5M" },
      VIP4: { maker: 0.04, taker: 0.075, volume: "€2.5M - €5M" },
      VIP5: { maker: 0.0, taker: 0.07, volume: "€5M - €10M" },
      VIP6: { maker: -0.005, taker: 0.05, volume: "€10M - €20M" },
      VIP7: { maker: -0.01, taker: 0.04, volume: "€20M - €50M" },
      VIP8: { maker: -0.01, taker: 0.015, volume: "> €50M" },
    },
  };

  const volumeThresholds = {
    USD: {
      VIP8: 5_000_000_000,
      VIP7: 1_000_000_000,
      VIP6: 500_000_000,
      VIP5: 200_000_000,
      VIP4: 100_000_000,
      VIP3: 20_000_000,
      VIP2: 10_000_000,
      VIP1: 5_000_000,
    },
    EUR: {
      VIP8: 50_000_000,
      VIP7: 20_000_000,
      VIP6: 10_000_000,
      VIP5: 5_000_000,
      VIP4: 2_500_000,
      VIP3: 500_000,
      VIP2: 250_000,
      VIP1: 100_000,
    },
  };

  // Keep maker/taker volumes in sync if using percentages
  useEffect(() => {
    if (!usePercentage) {
      const makerNum = Number(makerVolume) || 0;
      const takerNum = Number(takerVolume) || 0;
      setTradingVolume((makerNum + takerNum).toString());
    }
  }, [makerVolume, takerVolume, usePercentage]);

  const determineOrganicTier = (volume) => {
    const thresholds = volumeThresholds[currency];
    const tiers = Object.keys(thresholds);
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (volume >= thresholds[tier]) return tier;
    }
    return "VIP1";
  };

  const handlePercentChange = (type, value) => {
    const numeric = value.replace(/[^0-9.]/g, "");
    const pct = Math.min(Math.max(Number(numeric), 0), 100);
    if (type === "maker") {
      setMakerVolume(pct.toString());
      setTakerVolume((100 - pct).toString());
    } else {
      setTakerVolume(pct.toString());
      setMakerVolume((100 - pct).toString());
    }
  };

  const handleInputFormatChange = (val) => {
    if (!val) return;
    const isPercent = val === "percentage";
    setUsePercentage(isPercent);
    setMakerVolume("");
    setTakerVolume("");
    if (!isPercent) {
      setTradingVolume("");
    }
  };

  useEffect(() => {
    if (!showResults) return;

    const totalVolume = Number(tradingVolume) || 0;

    let makerVol = 0;
    let takerVol = 0;
    if (usePercentage) {
      const makerPct = parseFloat(makerVolume) / 100 || 0;
      const takerPct = parseFloat(takerVolume) / 100 || 0;
      makerVol = totalVolume * makerPct;
      takerVol = totalVolume * takerPct;
    } else {
      makerVol = Number(makerVolume) || 0;
      takerVol = Number(takerVolume) || 0;
    }

    const organicTier = determineOrganicTier(totalVolume);
    const fees = feeStructure[currency];

    const organicMakerFee = (makerVol * fees[organicTier].maker) / 100;
    const organicTakerFee = (takerVol * fees[organicTier].taker) / 100;
    const organicFee = organicMakerFee + organicTakerFee;

    if (!showProgramToggle) {
      setResults({
        organicTier,
        organicMakerFee,
        organicTakerFee,
        programmaticMakerFee: 0,
        programmaticTakerFee: 0,
        programmaticFee: 0,
        revenueLost: 0,
      });
      return;
    }

    const programmaticMakerFee = (makerVol * fees[programmaticTier].maker) / 100;
    const programmaticTakerFee = (takerVol * fees[programmaticTier].taker) / 100;
    const programmaticFee = programmaticMakerFee + programmaticTakerFee;
    const revenueLost = organicFee - programmaticFee;

    setResults({
      organicTier,
      organicMakerFee,
      organicTakerFee,
      programmaticMakerFee,
      programmaticTakerFee,
      programmaticFee,
      revenueLost,
    });
  }, [
    showResults,
    showProgramToggle,
    makerVolume,
    takerVolume,
    tradingVolume,
    usePercentage,
    currency,
    programmaticTier,
  ]);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-zinc-900 dark:text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">OKX Fees & Revenues Calculator</h1>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-7xl">
        {/* Card #1 */}
        <Card className="w-full max-w-md shadow-xl rounded-2xl transition-transform hover:scale-105">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Fee Calculation</h2>

            <div className="flex flex-col">
              <label className="mb-1 font-medium">Currency</label>
              <ToggleGroup
                type="single"
                value={currency}
                onValueChange={(val) => val && setCurrency(val)}
                className="flex w-full"
              >
                <ToggleGroupItem value="USD" className="w-1/2">
                  USD
                </ToggleGroupItem>
                <ToggleGroupItem value="EUR" className="w-1/2">
                  EUR
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Input
              type="number"
              placeholder="Total Trading Volume"
              value={tradingVolume}
              onChange={(e) => setTradingVolume(e.target.value)}
              disabled={!usePercentage}
            />

            <div className="flex flex-col">
              <label className="mb-1 font-medium">Maker / Taker Ratio</label>
              <ToggleGroup
                type="single"
                value={usePercentage ? "percentage" : "number"}
                onValueChange={handleInputFormatChange}
                className="flex w-full"
              >
                <ToggleGroupItem value="percentage" className="w-1/2">
                  Percentage
                </ToggleGroupItem>
                <ToggleGroupItem value="number" className="w-1/2">
                  Number
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Input
              type="number"
              placeholder={usePercentage ? "Maker %" : "Maker Volume"}
              value={makerVolume}
              onChange={(e) => {
                if (usePercentage) {
                  handlePercentChange("maker", e.target.value);
                } else {
                  setMakerVolume(e.target.value);
                }
              }}
            />

            <Input
              type="number"
              placeholder={usePercentage ? "Taker %" : "Taker Volume"}
              value={takerVolume}
              onChange={(e) => {
                if (usePercentage) {
                  handlePercentChange("taker", e.target.value);
                } else {
                  setTakerVolume(e.target.value);
                }
              }}
            />

            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={showProgramToggle}
                  onChange={() => setShowProgramToggle(!showProgramToggle)}
                  className="mr-2"
                />
                <label className="font-medium">Maker / Taker Program</label>
              </div>

              {showProgramToggle && (
                <ToggleGroup
                  type="single"
                  value={programmaticTier}
                  onValueChange={(val) => val && setprogrammaticTier(val)}
                  className="flex w-full"
                >
                  <ToggleGroupItem
                    value="VIP5"
                    className="w-1/3 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">VIP 5</span>
                      <span className="text-xs text-muted-foreground">(TMM / TMT)</span>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="VIP6"
                    className="w-1/3 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">VIP 6</span>
                      <span className="text-xs text-muted-foreground">(MM / MT)</span>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="VIP8"
                    className="w-1/3 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">VIP 8</span>
                      <span className="text-xs text-muted-foreground">(DMM / DMT)</span>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>

            <Button
              onClick={() => setShowResults(true)}
              className="w-full mt-3 py-2 text-base font-semibold"
            >
              Calculate
            </Button>

            {showResults && results && (
              <table className="w-full text-sm text-left border border-gray-300 dark:border-zinc-700 mt-4 rounded-lg overflow-hidden text-black dark:text-white">
                <thead>
                  <tr className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold">
                    <th className="border px-2 py-1">Type</th>
                    <th className="border px-2 py-1">Tier</th>
                    <th className="border px-2 py-1">Maker Fee</th>
                    <th className="border px-2 py-1">Taker Fee</th>
                    <th className="border px-2 py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Organic</td>
                    <td className="border px-2 py-1">{results.organicTier}</td>
                    <td className="border px-2 py-1">
                      ${results.organicMakerFee.toFixed(2)}
                    </td>
                    <td className="border px-2 py-1">
                      ${results.organicTakerFee.toFixed(2)}
                    </td>
                    <td className="border px-2 py-1">
                      {(results.organicMakerFee + results.organicTakerFee).toFixed(2)}
                    </td>
                  </tr>

                  {showProgramToggle && (
                    <>
                      <tr>
                        <td className="border px-2 py-1">Programmatic</td>
                        <td className="border px-2 py-1">{programmaticTier}</td>
                        <td className="border px-2 py-1">
                          ${results.programmaticMakerFee.toFixed(2)}
                        </td>
                        <td className="border px-2 py-1">
                          ${results.programmaticTakerFee.toFixed(2)}
                        </td>
                        <td className="border px-2 py-1">
                          {(results.programmaticMakerFee + results.programmaticTakerFee).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="font-semibold">
                        <td className="border px-2 py-1" colSpan={4}>
                          Revenue Lost
                        </td>
                        <td className="border px-2 py-1">
                          ${results.revenueLost.toFixed(2)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Card #2 */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <Card className="shadow-xl rounded-2xl transition-transform hover:scale-105">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-semibold mb-2">
                Current Fee Schedule ({currency})
              </h3>
              <table className="w-full text-sm text-left border border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden text-black dark:text-white">
                <thead>
                  <tr className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold">
                    <th className="border px-2 py-1">Tier</th>
                    <th className="border px-2 py-1">Monthly Trading Volume</th>
                    <th className="border px-2 py-1">Maker Fee</th>
                    <th className="border px-2 py-1">Taker Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(feeStructure[currency]).map(([tier, f]) => (
                    <tr key={tier}>
                      <td className="border px-2 py-1">{tier}</td>
                      <td className="border px-2 py-1">{f.volume}</td>
                      <td className="border px-2 py-1">{f.maker.toFixed(3)}%</td>
                      <td className="border px-2 py-1">{f.taker.toFixed(3)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {showResults && results && (
            <Card className="shadow-xl rounded-2xl transition-transform hover:scale-105">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-base font-semibold mb-2">Revenue Calculation</h3>
                {(() => {
                  const organicRevenue = results.organicMakerFee + results.organicTakerFee;
                  const organicCommission = organicRevenue * 0.03;
                  const programmaticRevenue = results.programmaticFee;
                  const programmaticCommission = programmaticRevenue * 0.03;

                  return (
                    <div className="text-sm space-y-2">
                      <h4 className="font-medium">Organic</h4>
                      <p>- Fee Tier: {results.organicTier}</p>
                      <p>- Total Revenue: ${organicRevenue.toFixed(2)}</p>
                      <p>- Total Commission: ${organicCommission.toFixed(2)}</p>

                      {showProgramToggle && (
                        <>
                          <h4 className="font-medium mt-2">Programmatic</h4>
                          <p>- Fee Tier: {programmaticTier}</p>
                          <p>- Total Revenue: ${programmaticRevenue.toFixed(2)}</p>
                          <p>- Total Commission: ${programmaticCommission.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/*
      */}
    </div>
  );
}
