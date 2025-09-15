import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Zap, AlertTriangle, CheckCircle, XCircle, Clock, Train, BarChart3, Info } from 'lucide-react';

const RailOptic = () => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [trains, setTrains] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [kpis, setKpis] = useState({
    totalThroughput: 0,
    averageDelay: 0,
    conflictsAverted: 0,
    efficiencyScore: 95
  });
  const [disruption, setDisruption] = useState({ trainId: '', delay: 0 });

  // Initialize trains
  useEffect(() => {
    const initialTrains = [
      {
        id: 'R101',
        name: 'Rajdhani Express',
        type: 'express',
        priority: 9,
        position: 10,
        targetPosition: 90,
        speed: 2,
        delay: 0,
        status: 'moving',
        track: 1,
        color: '#ef4444'
      },
      {
        id: 'F205',
        name: 'Freight Train',
        type: 'freight',
        priority: 3,
        position: 30,
        targetPosition: 85,
        speed: 1,
        delay: 5,
        status: 'moving',
        track: 2,
        color: '#8b5cf6'
      },
      {
        id: 'P302',
        name: 'Passenger Local',
        type: 'passenger',
        priority: 6,
        position: 65,
        targetPosition: 95,
        speed: 1.5,
        delay: 2,
        status: 'moving',
        track: 1,
        color: '#06b6d4'
      },
      {
        id: 'E404',
        name: 'Express Mail',
        type: 'express',
        priority: 8,
        position: 45,
        targetPosition: 88,
        speed: 2.2,
        delay: 0,
        status: 'moving',
        track: 2,
        color: '#f59e0b'
      }
    ];
    setTrains(initialTrains);
  }, []);

  // Simulation timer
  useEffect(() => {
    let interval;
    if (isSimulationRunning) {
      interval = setInterval(() => {
        setSimulationTime(prev => prev + 1);
        updateTrainPositions();
        updateKPIs();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  const updateTrainPositions = () => {
    setTrains(prevTrains => 
      prevTrains.map(train => {
        if (train.status === 'moving' && train.position < train.targetPosition) {
          return {
            ...train,
            position: Math.min(train.position + train.speed, train.targetPosition)
          };
        }
        return train;
      })
    );
  };

  const updateKPIs = () => {
    setKpis(prev => ({
      ...prev,
      totalThroughput: trains.filter(t => t.position >= t.targetPosition).length,
      averageDelay: Math.round(trains.reduce((sum, t) => sum + t.delay, 0) / trains.length),
      efficiencyScore: Math.max(85, 100 - trains.reduce((sum, t) => sum + t.delay, 0))
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptimalRecommendation = () => {
    // Simulate AI optimization logic
    const conflictingTrains = trains.filter(t => 
      t.track === 1 && t.position > 70 && t.position < 85
    );
    
    if (conflictingTrains.length > 1) {
      const highPriorityTrain = conflictingTrains.reduce((prev, curr) => 
        prev.priority > curr.priority ? prev : curr
      );
      const lowPriorityTrains = conflictingTrains.filter(t => t.id !== highPriorityTrain.id);
      
      const delayMinutes = Math.round(Math.random() * 10 + 5);
      
      setRecommendation({
        proceed: [highPriorityTrain.id],
        halt: lowPriorityTrains.map(t => t.id),
        reason: `Prioritizing ${highPriorityTrain.name} (Priority: ${highPriorityTrain.priority}) to minimize junction congestion and reduce total network delay.`,
        projectedDelaySaved: delayMinutes,
        confidence: 0.87
      });
    } else {
      // Random optimization suggestion
      const randomTrain = trains[Math.floor(Math.random() * trains.length)];
      const suggestion = Math.random() > 0.5 ? 'proceed' : 'halt';
      
      setRecommendation({
        proceed: suggestion === 'proceed' ? [randomTrain.id] : [],
        halt: suggestion === 'halt' ? [randomTrain.id] : [],
        reason: `Current traffic flow is optimal. Suggested minor adjustment to ${randomTrain.name} to maintain efficiency.`,
        projectedDelaySaved: Math.round(Math.random() * 8 + 2),
        confidence: 0.92
      });
    }
  };

  const acceptRecommendation = () => {
    setTrains(prevTrains => 
      prevTrains.map(train => {
        if (recommendation.halt.includes(train.id)) {
          return { ...train, status: 'halted', speed: 0 };
        }
        if (recommendation.proceed.includes(train.id)) {
          return { ...train, status: 'moving', speed: train.speed * 1.2 };
        }
        return train;
      })
    );
    
    setKpis(prev => ({
      ...prev,
      conflictsAverted: prev.conflictsAverted + 1
    }));
    
    setRecommendation(null);
    setShowExplanation(false);
  };

  const rejectRecommendation = () => {
    setRecommendation(null);
    setShowExplanation(false);
  };

  const createDisruption = () => {
    if (disruption.trainId && disruption.delay > 0) {
      setTrains(prevTrains =>
        prevTrains.map(train =>
          train.id === disruption.trainId
            ? { ...train, delay: train.delay + parseInt(disruption.delay), status: 'delayed' }
            : train
        )
      );
      setDisruption({ trainId: '', delay: 0 });
    }
  };

  const TrackVisualization = () => (
    <div className="bg-gray-900 rounded-lg p-6 mb-6">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
        <Train className="mr-2" size={20} />
        Live Track Status
      </h3>
      
      <div className="relative">
        {/* Track 1 */}
        <div className="flex items-center mb-8">
          <span className="text-white text-sm w-16">Track 1</span>
          <div className="flex-1 h-4 bg-gray-700 rounded-full relative mx-4">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 rounded-full opacity-30"></div>
            {trains.filter(t => t.track === 1).map(train => (
              <div
                key={train.id}
                className="absolute top-0 h-4 w-6 rounded-full transform -translate-y-0 transition-all duration-1000"
                style={{
                  left: `${train.position}%`,
                  backgroundColor: train.color,
                  boxShadow: train.status === 'halted' ? '0 0 10px red' : '0 0 5px rgba(255,255,255,0.5)'
                }}
                title={`${train.name} - ${train.status}`}
              >
                <div className="w-full h-full rounded-full animate-pulse"></div>
              </div>
            ))}
            {/* Junction marker */}
            <div className="absolute top-0 h-6 w-2 bg-yellow-500 transform -translate-y-1" style={{ left: '75%' }}>
              <div className="w-full h-full animate-pulse"></div>
            </div>
          </div>
          <span className="text-gray-400 text-xs w-20">Junction →</span>
        </div>
        
        {/* Track 2 */}
        <div className="flex items-center">
          <span className="text-white text-sm w-16">Track 2</span>
          <div className="flex-1 h-4 bg-gray-700 rounded-full relative mx-4">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600 via-purple-500 to-green-500 rounded-full opacity-30"></div>
            {trains.filter(t => t.track === 2).map(train => (
              <div
                key={train.id}
                className="absolute top-0 h-4 w-6 rounded-full transform -translate-y-0 transition-all duration-1000"
                style={{
                  left: `${train.position}%`,
                  backgroundColor: train.color,
                  boxShadow: train.status === 'halted' ? '0 0 10px red' : '0 0 5px rgba(255,255,255,0.5)'
                }}
                title={`${train.name} - ${train.status}`}
              >
                <div className="w-full h-full rounded-full animate-pulse"></div>
              </div>
            ))}
            {/* Junction marker */}
            <div className="absolute top-0 h-6 w-2 bg-yellow-500 transform -translate-y-1" style={{ left: '75%' }}>
              <div className="w-full h-full animate-pulse"></div>
            </div>
          </div>
          <span className="text-gray-400 text-xs w-20">Junction →</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Train className="mr-3 text-blue-600" size={32} />
              RailOptic - Controller's Co-Pilot
            </h1>
            <p className="text-gray-600 mt-1">Intelligent Railway Traffic Management System</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Simulation Time</div>
              <div className="text-2xl font-mono font-bold text-blue-600 flex items-center">
                <Clock className="mr-2" size={20} />
                {formatTime(simulationTime)}
              </div>
            </div>
            
            <button
              onClick={() => setIsSimulationRunning(!isSimulationRunning)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 ${
                isSimulationRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isSimulationRunning ? <Pause size={20} /> : <Play size={20} />}
              <span>{isSimulationRunning ? 'Pause' : 'Start'} Simulation</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <TrackVisualization />
          
          {/* AI Recommendation Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Zap className="mr-2 text-yellow-500" size={20} />
                AI Optimization Engine
              </h3>
              <button
                onClick={getOptimalRecommendation}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                disabled={!!recommendation}
              >
                <Zap size={16} />
                <span>Get Optimal Move</span>
              </button>
            </div>
            
            {recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-blue-900">AI Recommendation</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Confidence: {(recommendation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {recommendation.proceed.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium text-green-700">Proceed:</span> {recommendation.proceed.join(', ')}
                    </p>
                  )}
                  {recommendation.halt.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium text-red-700">Halt:</span> {recommendation.halt.join(', ')}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Projected Time Saved:</span> {recommendation.projectedDelaySaved} minutes
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={acceptRecommendation}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-1"
                  >
                    <CheckCircle size={16} />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={rejectRecommendation}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center space-x-1"
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center space-x-1"
                  >
                    <Info size={16} />
                    <span>Why?</span>
                  </button>
                </div>
                
                {showExplanation && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                    <p className="text-sm text-gray-700">{recommendation.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* What-If Scenario */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-orange-500" size={20} />
              Create Disruption Scenario
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <select
                value={disruption.trainId}
                onChange={(e) => setDisruption(prev => ({ ...prev, trainId: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Train</option>
                {trains.map(train => (
                  <option key={train.id} value={train.id}>{train.id} - {train.name}</option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Delay (minutes)"
                value={disruption.delay}
                onChange={(e) => setDisruption(prev => ({ ...prev, delay: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2"
              />
              
              <button
                onClick={createDisruption}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                disabled={!disruption.trainId || !disruption.delay}
              >
                Add Disruption
              </button>
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="space-y-6">
          {/* Train Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 text-blue-500" size={20} />
              Active Trains
            </h3>
            
            <div className="space-y-3">
              {trains.map(train => (
                <div key={train.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: train.color }}>
                      {train.id}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      train.status === 'moving' ? 'bg-green-100 text-green-800' :
                      train.status === 'halted' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {train.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>{train.name}</div>
                    <div>Priority: {train.priority}/10</div>
                    <div>Delay: +{train.delay} mins</div>
                    <div>Progress: {Math.round(train.position)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* KPI Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 text-green-500" size={20} />
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Total Throughput</span>
                  <span className="font-semibold">{kpis.totalThroughput} trains</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Average Delay</span>
                  <span className="font-semibold">{kpis.averageDelay} mins</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Conflicts Averted</span>
                  <span className="font-semibold text-green-600">{kpis.conflictsAverted}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">System Efficiency</span>
                  <span className="font-semibold text-blue-600">{kpis.efficiencyScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${kpis.efficiencyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RailOptic;