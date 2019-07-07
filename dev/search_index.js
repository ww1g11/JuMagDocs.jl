var documenterSearchIndex = {"docs":
[{"location":"#JuMag.jl-1","page":"JuMag.jl","title":"JuMag.jl","text":"","category":"section"},{"location":"#","page":"JuMag.jl","title":"JuMag.jl","text":"A Julia package for classical spin dynamics and micromagnetic simulations with GPU support.","category":"page"},{"location":"tutorial/#Tutorial-1","page":"Tutorial","title":"Tutorial","text":"","category":"section"},{"location":"tutorial/#An-example-–-vortex-1","page":"Tutorial","title":"An example – vortex","text":"","category":"section"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"To start a micromagnetic simulation, we first create a FDMesh","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"mesh = FDMesh(dx=2e-9, dy=2e-9, dz=2e-9, nx=100, ny=100)","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"After that, we create a simulation","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"sim = Sim(mesh, name=\"vortex\")","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"and set the damping to 0.5 and switch off the precession term in LLG equation:","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"sim.driver.alpha = 0.5\nsim.driver.precession = false","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"The geometry of the system can be defined by","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"set_Ms(sim, circular_Ms)","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"where circular_Ms could be a scalar or a function. The function should take six parameters (i,j,k,dx,dy,dz), for instance","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"function circular_Ms(i,j,k,dx,dy,dz)\n    if (i-50.5)^2 + (j-50.5)^2 <= 50^2\n        return 8.6e5\n    end\n    return 0.0\nend","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"We add the exchange interaction and the demagnetization field to the system.","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"add_exch(sim, 1.3e-11)\nadd_demag(sim)","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"We need to initialise the system which can be done by defining a function","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"function init_fun(i,j,k,dx,dy,dz)\n  x = i-50.5\n  y = j-50.5\n  r = (x^2+y^2)^0.5\n  if r<5\n    return (0,0,1)\n  end\n  return (y/r, -x/r, 0)\nend","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"and using","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"init_m0(sim, init_fun)","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"To trigger the simulation we relax the system","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"relax(sim, maxsteps=1000)","category":"page"},{"location":"tutorial/#How-to-enable-GPU-1","page":"Tutorial","title":"How to enable GPU","text":"","category":"section"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"Using FDMeshGPU instead of FDMesh to switch on the GPU calculation,","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"mesh = FDMeshGPU(dx=2e-9, dy=2e-9, dz=2e-9, nx=100, ny=100)","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"The script to use GPU to obtain the vortex structure is shown below:","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"using JuMag\nusing Printf\nusing NPZ\n\nJuMag.cuda_using_double(true)\nmesh =  FDMeshGPU(dx=2e-9, dy=2e-9, dz=5e-9, nx=100, ny=100, nz=4)\n\nfunction circular_Ms(i,j,k,dx,dy,dz)\n    x = i-50.5\n    y = j-50.5\n    r = (x^2+y^2)^0.5\n    if (i-50.5)^2 + (j-50.5)^2 <= 50^2\n        return 8e5\n    end\n    return 0.0\nend\n\nfunction init_fun(i,j,k,dx,dy,dz)\n  x = i-50.5\n  y = j-50.5\n  r = (x^2+y^2)^0.5\n  if r<5\n    return (0,0,1)\n  end\n  return (y/r, -x/r, 0)\nend\n\nfunction relax_system()\n  sim = Sim(mesh, driver=\"SD\", name=\"sim\")\n  set_Ms(sim, circular_Ms)\n\n  add_exch(sim, 1.3e-11, name=\"exch\")\n  add_demag(sim)\n\n  init_m0(sim, init_fun)\n  relax(sim, maxsteps=2000, stopping_torque=1.0, save_vtk_every = 100, save_m_every=-1)\n  npzwrite(\"m0.npy\", sim.spin)\nend\n\nrelax_system()","category":"page"},{"location":"tutorial/#Standard-Problem-#4-1","page":"Tutorial","title":"Standard Problem #4","text":"","category":"section"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"using JuMag\nusing Printf\nusing NPZ\n\nmesh =  FDMeshGPU(nx=200, ny=50, nz=1, dx=2.5e-9, dy=2.5e-9, dz=3e-9)\n\nfunction relax_system(mesh)\n  sim = Sim(mesh, name=\"std4_relax\", driver=\"SD\")\n  set_Ms(sim, 8.0e5)\n  sim.driver.min_tau = 1e-10\n\n  add_exch(sim, 1.3e-11)\n  add_demag(sim)\n\n  init_m0(sim, (1, 0.25, 0.1))\n\n  relax(sim, maxsteps=5000, stopping_torque=10.0)\n  npzwrite(\"m0.npy\", Array(sim.spin))\nend\n\nfunction apply_field1(mesh)\n  sim = Sim(mesh, name=\"std4_dyn\")\n  set_Ms(sim, 8.0e5)\n  sim.driver.alpha = 0.02\n  sim.driver.gamma = 2.211e5\n\n  mT = 0.001 / (4*pi*1e-7)\n  add_exch(sim, 1.3e-11)\n  add_demag(sim)\n  add_zeeman(sim, (-24.6*mT, 4.3*mT, 0))\n\n  init_m0(sim, npzread(\"m0.npy\"))\n\n  for i=1:100\n    run_until(sim, 1e-11*i)\n  end\nend\n\nrelax_system(mesh)\nprintln(\"Start step2 !!!\")\napply_field1(mesh)\nprintln(\"Run step2 again!!!\")\n@time apply_field1(mesh)\nprintln(\"Done!\")","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"The output file is a simple text compatible with Gnuplot, like used for plot below.","category":"page"},{"location":"tutorial/#","page":"Tutorial","title":"Tutorial","text":"(Image: std4)","category":"page"},{"location":"equations/#Implemented-equations-1","page":"Implemented equations","title":"Implemented equations","text":"","category":"section"},{"location":"equations/#Energies-and-effective-field-1","page":"Implemented equations","title":"Energies and effective field","text":"","category":"section"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"vecH_eff=vecH_mathrmex+vecH_mathrmzeeman+vecH_mathrmanis+vecH_mathrmdemag+vecH_mathrmdmi","category":"page"},{"location":"equations/#Exchange-energy-1","page":"Implemented equations","title":"Exchange energy","text":"","category":"section"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"  E_mathrmex = int_V A (nabla vecm)^2 mathrmdV\n  \n  The exchange energy is a sum of exchange interactions from 6 nearest neighbor cells","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\vec{H}{i, e x}=\\frac{A}{\\mu{0}} \\sum{<i, j>} \\vec{m}{j}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"#### Zeeman energy\n  ```math\n  E_\\mathrm{ex} = \\int_{V} \\vec{H} \\cdot \\vec{m} \\mathrm{d}V\n  ```\n  Applied zeeman field:","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\vec{H}\\mathrm{i,zeeman}=\\vec{H}\\mathrm{ext}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"#### Anisotropy\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math E\\mathrm{anis} = -\\int{V} K_{u} (\\vec{m} \\cdot \\hat{u})^2 \\, dV","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"Set the angles between the anistropy axis and x,y,z coordinates as α,β,γ respectively, the anistropy field can be written as :","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\vec{H}\\mathrm{i,anis}=\\frac{2 \\mathcal{K}{u}}{\\mu{s}}\\left({m{x}  \\cos^{2}\\alpha \\cdot\\vec{i}} +{m{y}  \\cos^{2}\\beta \\cdot \\vec{j}}+ m{z} \\cos^{2}\\gamma \\cdot \\vec{k} \\right)","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"#### Bulk DMI energy\n\n  ```math\n  E_{\\mathrm{dmi}} = \\int_V D \\vec{m} \\cdot (\\nabla \\times \\vec{m}) \\, \\mathrm{d}V\n  ```\n\n\n#### Demagnetization","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\mathscr{E}{\\text { demag }}=-\\frac{1}{2} \\overrightarrow{\\mathbf{M}} \\cdot \\overrightarrow{\\mathbf{B}}{\\text { demag }}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"The demagnetization is from dipolar interactions between spins, the field is as the format:","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\overrightarrow{\\mathbf{B}}{\\text { demag } }=\\widehat{\\mathbf{K}}{i j} * \\overrightarrow{\\mathbf{M}}_{j}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"In JuMag we use FFT to calculate the demag kernel $/hat{k_{ij}} $\n\n\n\n\n\n\n\n\n\n## LLG equation\n\nThe LLG equation is written as\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\frac{\\partial \\vec{m}}{\\partial t} = - \\gamma \\vec{m} \\times \\vec{H} + \\alpha \\vec{m} \\times  \\frac{\\partial \\vec{m}}{\\partial t}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"\nand the corresponding LL form is given by\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math (1+\\alpha^2)\\frac{\\partial \\vec{m}}{\\partial t} = - \\gamma \\vec{m} \\times \\vec{H} - \\alpha \\gamma \\vec{m} \\times (\\vec{m} \\times \\vec{H})","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"\n## LLG equation with extensions\n\nFor the driver `LLG_STT_CPP` the implemented equations is\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\frac{\\partial \\vec{m}}{\\partial t} = - \\gamma \\vec{m} \\times \\vec{H} + \\alpha \\vec{m} \\times  \\frac{\\partial \\vec{m}}{\\partial t}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"(\\vec{u} \\cdot \\nabla) \\vec{m} - \\beta [\\vec{m}\\times (\\vec{u} \\cdot \\nabla)\\vec{m}] - a_J \\vec{m} \\times (\\vec{m} \\times \\vec{p})\n\\eta a_J \\vec{m} \\times \\vec{p}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"\nThe simulation related to spin transfer torques (in-plane and current-perpendicular-to-plane) and the spin orbit torques can use the `LLG_STT_CPP` driver.\n## Steepest descent method\nWe provide a steepest descent energy minimization method for a complicated system,which is of the form\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math x{k+1} = xk + \\alphak dk ","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"where ","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math dk = - \\nabla f(xk)","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"And for the micromagnetics, we have","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\mathbf{m}{k+1} = \\mathbf{m}{k} - {\\tau}k \\mathbf{m}k  \\times (\\mathbf{m}k \\times \\mathbf{H}{\\mathrm{eff}}) ","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"In practice, we use the following update rule to keep the magnetization vector normalized.\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\boldsymbol{m}{k+1}=\\boldsymbol{m}{k}-{\\tau}k \\frac{\\boldsymbol{m}{k}+\\boldsymbol{m}{k+1}}{2} \\times\\left(\\boldsymbol{m}{k} \\times \\boldsymbol{H}{\\mathrm{eff}}\\left(\\boldsymbol{m}{k}\\right)\\right)","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\boldsymbol{m}{k+1}^2 = \\boldsymbol{m}{k}^2","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"From the equation we have:","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math (1+\\frac{{\\tau}k^2}{4} \\boldsymbol{f}k^2)\\mathbf{m}{k+1} =  (1-\\frac{{\\tau}k^2}{4} \\boldsymbol{f}k^2)\\mathbf{m}{k} -  {\\tau}k \\mathbf{g}k","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"where\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\begin{aligned}  \\mathbf{f}k& = \\mathbf{m}k \\times \\mathbf{H}{\\mathrm{eff}} \\\\boldsymbol{g}{k} &=\\boldsymbol{m}{k} \\times\\left(\\boldsymbol{m}{k} \\times \\boldsymbol{H}_{\\mathrm{eff}}\\right)  \\end{aligned}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"The step size $\\tau_k$  can be computed by\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\tau{k}^{1}=\\frac{\\sum{i} \\boldsymbol{s}{k-1}^{i} \\cdot \\boldsymbol{s}{k-1}^{i}}{\\sum{i} \\boldsymbol{s}{k-1}^{i} \\cdot \\boldsymbol{y}{k-1}^{i}} \\quad, \\quad \\tau{k}^{2}=\\frac{\\sum{i} \\boldsymbol{s}{k-1}^{i} \\cdot \\boldsymbol{y}{k-1}^{i}}{\\sum{i} \\boldsymbol{y}{k-1}^{i} \\cdot \\boldsymbol{y}{k-1}^{i}}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"where \n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\begin{aligned}  \\boldsymbol{s}{k-1} &=\\boldsymbol{m}{k}-\\boldsymbol{m}{k-1} \\ \\boldsymbol{y}{k-1} &=\\boldsymbol{g}{k}-\\boldsymbol{g}{k-1} \\end{aligned}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"\n\n\n## Monte Carlo Simulation\n\nFor triangular mesh (2D), the system energy reads\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math H= \\sum{\\langle i, j\\rangle}  \\vec{D}{i j} \\cdot\\left(\\vec{S}{i} \\times \\vec{S}{j}\\right) -J \\sum{\\langle i, j\\rangle} \\vec{S}{i} \\cdot \\vec{S}{j}- \\lambda \\sum{\\langle i, j\\rangle} S{i}^{z} S{j}^{z} -K \\sum{i}\\left(S{i}^{z}\\right)^{2}","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"\nwhere\n","category":"page"},{"location":"equations/#","page":"Implemented equations","title":"Implemented equations","text":"math \\vec{D}{i j} = D \\hat{z} \\times \\hat{r}{ij}  + D_z^{j} \\hat{z} ```","category":"page"},{"location":"notes/#Notes-1","page":"Notes","title":"Notes","text":"","category":"section"},{"location":"notes/#Reducing-the-startup-time-1","page":"Notes","title":"Reducing the startup time","text":"","category":"section"},{"location":"notes/#","page":"Notes","title":"Notes","text":"Julia is a dynamically-typed language, so the input script will be compiled when we start a simulation. However, the typical startup time in our case ranges from 1s to 30s depends on the complexity of the problem. It is painful especially if we run the simulation using GPU. Luckily, we can compile our package using PackageCompiler.jl:","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"using PackageCompiler\ncompile_incremental(:JuMag)","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"After finishing the compilation, a dyn.so file will be generated. If we start julia using julia -J /path/to/dyn.so the stratup time will be ignorable.","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"Note: If you got an error similar to that shown at https://github.com/JuliaLang/PackageCompiler.jl/issues/184, using dev PackageCompiler may solve the issue.","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"If other errors appear, it is better to figure out which package is failed","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"compile_incremental(:FFTW, :CUDAdrv, :CUDAnative, :CuArrays, force=false)","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"and remove that package from deps in Project.toml. For example, if CuArrays fails, comment the line","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"#CuArrays = \"3a865a2d-5b23-5a0f-bc46-62713ec82fae\"","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"may solve the problem.","category":"page"},{"location":"notes/#LLG-equation-with-Zhang-Li-extension-1","page":"Notes","title":"LLG equation with Zhang-Li extension","text":"","category":"section"},{"location":"notes/#","page":"Notes","title":"Notes","text":"fracpartial vecmpartial t = - gamma vecm times vecH + alpha vecm times  fracpartial vecmpartial t   + u_0 (vecj_s cdot nabla) vecm - beta u_0 vecmtimes (vecj_s cdot nabla)vecm","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"where","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"u_0=fracp g mu_B2 e M_s=fracp g mu_B a^32 e mu_s","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"and mu_B=ehbar(2m) is the Bohr magneton. In LL form","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"(1+alpha^2)fracpartial vecmpartial t = - gamma vecm times vecH - alpha gamma vecm times (vecm times vecH) + (1+alphabeta) u_0 vectau - (beta-alpha) u_0 (vecmtimes vectau)","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"where vectau=(vecj_s cdot nabla)vecm","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"Note that","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"u_0 (vecj_s cdot nabla) vecm=  - u_0 vecmtimesvecmtimes (vecj_s cdot nabla)vecm","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"so this torque is damping-like torque and the last torque is field-like torque. Therefore, we rewrite the LLG equation in the form","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"fracpartial vecmpartial t =\nF(vecm)\ntimes vecm","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"where","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"F(vecm) = frac1(1+alpha^2)\ngamma vecH + u_0 (beta-alpha)vectau+\nfrac1(1+alpha^2)vecm times alpha gamma\n  vecH + u_0 (1+alphabeta) vectau","category":"page"},{"location":"notes/#Cayley-transformation-1","page":"Notes","title":"Cayley transformation","text":"","category":"section"},{"location":"notes/#","page":"Notes","title":"Notes","text":"The LLG equation can be cast into","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"fracpartial vecmpartial t = hatF(vecm) cdot vecm","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"where the operator \\hat{} is defined as","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"hatx = left( beginmatrix\n  0  -x_3  x_2 \n  x_3  0  -x_1 \n  -x_2  x_1  0\n endmatrix right)","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"Using the Cayley transfromation, the LLG equation can be written as","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"fracpartial Omegapartial t = F - frac12 Omega F\n- frac14 Omega F Omega","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"where","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"Omega = hatomega","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"So one has","category":"page"},{"location":"notes/#","page":"Notes","title":"Notes","text":"fracpartial vecomegapartial t = vecF - frac12\n(omega times vecF)\n+ frac14 (omega cdot vecF) vecomega","category":"page"},{"location":"functions/#Function-reference-1","page":"Function reference","title":"Function reference","text":"","category":"section"},{"location":"functions/#","page":"Function reference","title":"Function reference","text":"FDMesh\nSim","category":"page"},{"location":"functions/#JuMag.FDMesh","page":"Function reference","title":"JuMag.FDMesh","text":"FDMesh(;dx=1e-9, dy=1e-9, dz=1e-9, nx=1, ny=1, nz=1, pbc=\"open\")\n\nCreate a FDMesh for given parameters. pbc could be any combination of \"x\", \"y\" and \"z\".\n\n\n\n\n\n","category":"type"},{"location":"functions/#JuMag.Sim","page":"Function reference","title":"JuMag.Sim","text":"Sim(mesh::Mesh; driver=\"LLG\", name=\"dyn\", integrator=\"Dopri5\")\n\nCreate a simulation instance for given mesh.\n\n\n\n\n\n","category":"function"}]
}
