using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace FiresMk.Server.Services
{
    public class PeriodicPythonScriptRunner : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public PeriodicPythonScriptRunner(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // Run the Python script logic here
                using (var scope = _serviceProvider.CreateScope())
                {
                    var scriptExecutor = scope.ServiceProvider.GetRequiredService<IPythonScriptExecutor>();
                    await scriptExecutor.RunScriptAsync();
                }

                // Wait for 30 seconds before running again
                await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
            }
        }
    }
}
