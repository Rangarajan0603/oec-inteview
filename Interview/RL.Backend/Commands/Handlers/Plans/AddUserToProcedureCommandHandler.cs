using System.Linq;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RL.Backend.Exceptions;
using RL.Backend.Models;
using RL.Data;
using RL.Data.DataModels;

namespace RL.Backend.Commands.Handlers.Plans
{
	public class AddUserToProcedureCommandHandler : IRequestHandler<AddUserToProcedureCommand, ApiResponse<Unit>>
	{
		private readonly RLContext _context;

		public AddUserToProcedureCommandHandler(RLContext context)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
		}

		public async Task<ApiResponse<Unit>> Handle(AddUserToProcedureCommand request, CancellationToken cancellationToken)
		{
			try
			{
				if(request.PlanId < 1)
					return ApiResponse<Unit>.Fail(new BadRequestException("Invalid PlanId"));

				if(request.ProcedureId < 1)
					return ApiResponse<Unit>.Fail(new BadRequestException("Invalid ProcedureId"));

				if(request.UserId < 1)
					return ApiResponse<Unit>.Fail(new BadRequestException("Invalid UserId"));

				var plan = await _context.Plans
				                         .Include(plan => plan.PlanProcedures)
				                         .ThenInclude(planProc => planProc.Users)
				                         .FirstOrDefaultAsync(plan => plan.PlanId == request.PlanId, cancellationToken);

				var procedure = await _context.Procedures.FirstOrDefaultAsync(proc => proc.ProcedureId == request.ProcedureId, cancellationToken);
				var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId, cancellationToken);

				if(plan is null)
					return ApiResponse<Unit>.Fail(new NotFoundException($"PlanId: {request.PlanId} not found"));

				if(procedure is null)
					return ApiResponse<Unit>.Fail(new NotFoundException($"ProcedureId: {request.ProcedureId} not found"));

				if(user is null)
					return ApiResponse<Unit>.Fail(new NotFoundException($"UserId: {request.UserId} not found"));

				if(plan.PlanProcedures.Any(planProc => planProc.ProcedureId == procedure.ProcedureId &&
				                                       planProc.Users.Any(u => u.UserId == user.UserId)))
					return ApiResponse<Unit>.Succeed(new Unit());

				var planProc = plan.PlanProcedures.First(planProc => planProc.ProcedureId == procedure.ProcedureId);
				planProc.Users.Add(user);

				await _context.SaveChangesAsync(cancellationToken);

				return ApiResponse<Unit>.Succeed(new Unit());
			}
			catch(Exception e)
			{
				return ApiResponse<Unit>.Fail(e);
			}
		}
	}

	public static class Extensions
	{
		public static void TryUpdateManyToMany<T, TKey>(this DbContext db, IEnumerable<T> currentItems, IEnumerable<T> newItems, Func<T, TKey> getKey)
			where T : class
		{
			db.Set<T>().RemoveRange(currentItems.Except(newItems, getKey));
			db.Set<T>().AddRange(newItems.Except(currentItems, getKey));
		}

		public static IEnumerable<T> Except<T, TKey>(this IEnumerable<T> items, IEnumerable<T> other, Func<T, TKey> getKeyFunc)
		{
			return items
			       .GroupJoin(other, getKeyFunc, getKeyFunc, (item, tempItems) => new { item, tempItems })
			       .SelectMany(t => t.tempItems.DefaultIfEmpty(), (t, temp) => new { t, temp })
			       .Where(t => ReferenceEquals(null, t.temp) || t.temp.Equals(default(T)))
			       .Select(t => t.t.item);
		}
	}
}